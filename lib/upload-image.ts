import { PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./s3";
import crypto from "crypto";
import { cache } from 'react';

/**
 * S3 Configuration from Environment
 */
const BUCKET_NAME = process.env.NEXT_PUBLIC_LIARA_BUCKET_NAME || process.env.LIARA_BUCKET_NAME || 'aso-shno-storage';
const PUBLIC_URL = process.env.NEXT_PUBLIC_LIARA_URL;

/**
 * Clean a key or URL into a raw S3 Key (e.g. products/123/main.png)
 */
function getCleanKey(input: string): string {
    if (!input || typeof input !== 'string') return "";
    if (input.length > 500 || input.includes('  ')) return "";

    let key = input;

    if (key.startsWith('http')) {
        try {
            const url = new URL(key);
            let path = url.pathname;

            // Remove leading slash
            path = path.replace(/^\//, "");

            // If Path-Style URL (starts with bucket name)
            if (path.startsWith(BUCKET_NAME + '/')) {
                return path.substring(BUCKET_NAME.length + 1);
            }

            return path;
        } catch (e) {
            return key.replace(/^\//, "");
        }
    }

    return key.replace(/^\//, "");
}

/**
 * Generates a Signed URL (Lara Presigned URL)
 */
export const getSignedImageUrl = cache(async (key: string | null | undefined): Promise<string> => {
    if (!key || typeof key !== 'string' || key.length < 3) return '/logo/logo.png';

    // If already signed, return as is
    if (key.includes('X-Amz-Signature')) return key;

    const cleanKey = getCleanKey(key);
    if (!cleanKey) return '/logo/logo.png';

    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: cleanKey,
        });
        return await getSignedUrl(s3, command, { expiresIn: 604800 });
    } catch (error) {
        console.error('[S3] Error signing URL:', error);
        return '/logo/logo.png';
    }
});

/**
 * Constructs a Public URL using the Internal Media Proxy
 * این تابع حالا آدرس‌ها را به سمت پروکسی داخلی هدایت می‌کند تا مشکل ۴۰۴ حل شود.
 */
export function getPublicImageUrl(key: string | null | undefined): string {
    if (!key || typeof key !== 'string' || key.length < 3) return '/logo/logo.png';

    // اگر از قبل یک آدرس کامل است
    if (key.startsWith('http')) {
        // اگر آدرس مربوط به استوریج خودمان است، آن را به پروکسی تبدیل کنیم تا مشکل دسترسی حل شود
        if (key.includes('liara.site') || key.includes('liara.space')) {
            const cleanKey = getCleanKey(key);
            return `/api/media/${cleanKey}`;
        }
        return key;
    }

    // اگر از قبل مسیر پروکسی است
    if (key.startsWith('/api/media/')) return key;

    const cleanKey = getCleanKey(key);
    return `/api/media/${cleanKey}`;
}

/**
 * Diagnostic: List ONLY product files to verify
 */
export async function listBucketFiles() {
    try {
        const data = await s3.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: 'products/',
            MaxKeys: 5
        }));
        console.log("[S3 Diagnostic] Files in products/ folder:", data.Contents?.map(c => c.Key));
    } catch (e) {
        console.error("[S3 Diagnostic] Failed to list files:", e);
    }
}

/**
 * Unified Helper: Returns the Proxy URL for all images
 */
export async function getImageUrl(key: string | null | undefined): Promise<string> {
    // اجرای دیاگنوزیک در محیط توسعه
    if (process.env.NODE_ENV === 'development') {
        listBucketFiles();
    }
    // در سیستم جدید، استفاده از پروکسی پایدارترین راه برای لوکال است
    return getPublicImageUrl(key);
}

/**
 * Standard S3 Upload
 */
export async function uploadS3Object(key: string, file: Buffer | Uint8Array, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
    });

    try {
        await s3.send(command);
        console.log(`[S3] Uploaded: ${key}`);
        return key;
    } catch (error) {
        console.error('[S3] Upload Error:', error);
        throw error;
    }
}

/**
 * Delete Object and Folders
 */
export async function deleteS3Object(key: string) {
    if (!key) return;
    const cleanKey = getCleanKey(key);

    try {
        await s3.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: cleanKey,
        }));
        console.log(`[S3] Deleted: ${cleanKey}`);
    } catch (error) {
        console.error(`[S3] Delete Error (${cleanKey}):`, error);
    }
}

export async function deleteS3Folder(prefix: string, id: string) {
    const folderKey = `${prefix}/${id}/`;
    try {
        const list = await s3.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: folderKey,
        }));

        if (list.Contents && list.Contents.length > 0) {
            await s3.send(new DeleteObjectsCommand({
                Bucket: BUCKET_NAME,
                Delete: {
                    Objects: list.Contents.map((item) => ({ Key: item.Key! })),
                },
            }));
            console.log(`[S3] Deleted Folder: ${folderKey}`);
        }
    } catch (error) {
        console.error(`[S3] Folder Delete Error (${folderKey}):`, error);
    }
}

/**
 * Logic Helpers
 */
export async function uploadProductImage(productId: string, file: File, isMain: boolean = false) {
    const buffer = Buffer.from(await file.arrayBuffer());
    // استفاده از پسوند webp طبق تجربه موفق قبلی شما
    const fileName = isMain ? `main.webp` : `gallery-${crypto.randomUUID()}.webp`;
    const key = `products/${productId}/${fileName}`;

    console.log(`[S3] Uploading image as WebP: ${key}`);
    // آپلود با ContentType مخصوص تصویر برای جلوگیری از دانلود خودکار در برخی مرورگرها
    return await uploadS3Object(key, buffer, 'image/webp');
}

export async function deleteProductImages(productId: string) {
    await deleteS3Folder('products', productId);
}

export async function uploadPostImage(postId: string, file: File) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split('.').pop() || 'png';
    const key = `posts/${postId}/${crypto.randomUUID()}.${extension}`;
    return await uploadS3Object(key, buffer, file.type);
}

export async function uploadSystemImage(folder: string, file: File) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${folder}/${crypto.randomUUID()}-${file.name}`;
    return await uploadS3Object(key, buffer, file.type);
}

export async function deleteFolder(id: string, type: 'product' | 'post' = 'product') {
    await deleteS3Folder(type === 'post' ? 'posts' : 'products', id);
    return { success: true };
}
