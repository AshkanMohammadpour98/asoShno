import { PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "./s3";
import crypto from "crypto";

/**
 * پیکربندی متغیرهای محیطی S3
 */
const BUCKET_NAME = process.env.LIARA_BUCKET_NAME;
const PUBLIC_URL = process.env.NEXT_PUBLIC_LIARA_URL;

/**
 * اعتبارسنجی فایل (حجم و نوع)
 */
function validateFile(file: File) {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

    if (file.size > MAX_SIZE) {
        throw new Error(`حجم فایل نباید بیشتر از ۱۰ مگابایت باشد. (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('فقط تصاویر با فرمت‌های JPG, PNG, WEBP, GIF و SVG مجاز هستند.');
    }
}

/**
 * آپلود تصویر در مسیر استاندارد:
 * {folder}/{id}/{uniqueFileName}.{ext}
 */
async function uploadToS3(folder: string, id: string, file: File, prefix: string = 'img'): Promise<string> {
    validateFile(file);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // استخراج پسوند فایل
    const extension = file.type.split('/')[1]?.split('+')[0] || 'jpg';

    // استانداردسازی نام فایل برای جلوگیری از مشکل با حروف فارسی و کاراکترهای خاص
    const cleanPrefix = prefix.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const fileName = `${cleanPrefix}-${crypto.randomUUID()}.${extension}`;
    const key = `${folder}/${id}/${fileName}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
    });

    try {
        await s3.send(command);
        return key;
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw new Error('خطا در بارگذاری تصویر به فضای ابری.');
    }
}

/**
 * آپلود تصویر محصول
 */
export async function uploadProductImage(productId: string, file: File, isMain: boolean = false): Promise<string> {
    return uploadToS3('products', productId, file, isMain ? 'main' : 'gallery');
}

/**
 * آپلود تصویر مقاله (مجله)
 */
export async function uploadPostImage(postId: string, file: File): Promise<string> {
    return uploadToS3('posts', postId, file, 'featured');
}

/**
 * آپلود فایل‌های سیستمی (لوگو، هیرو و ...)
 */
export async function uploadSystemImage(folder: 'logo' | 'hero' | 'settings', file: File): Promise<string> {
    validateFile(file);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extension = file.type.split('/')[1]?.split('+')[0] || 'png';

    // استانداردسازی نام فایل سیستم
    const cleanFileName = file.name.replace(/[^a-z0-9.]/gi, "-").toLowerCase();
    const key = `${folder}/${Date.now()}-${cleanFileName}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
    });

    await s3.send(command);
    return key;
}

/**
 * حذف یک شیء از S3 بر اساس Key
 */
export async function deleteS3Object(key: string): Promise<void> {
    if (!key || key.startsWith('/')) return; // جلوگیری از حذف آدرس‌های محلی قدیمی

    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    try {
        await s3.send(command);
    } catch (error) {
        console.error(`S3 Delete Error (Key: ${key}):`, error);
    }
}

/**
 * حذف دسته‌ای از اشیاء بر اساس لیست Keyها
 */
export async function deleteS3Objects(keys: string[]): Promise<void> {
    const validKeys = keys.filter(k => !!k && !k.startsWith('/'));
    if (validKeys.length === 0) return;

    const command = new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
            Objects: validKeys.map(key => ({ Key: key })),
        },
    });

    try {
        await s3.send(command);
    } catch (error) {
        console.error('S3 Batch Delete Error:', error);
    }
}

/**
 * حذف تمامی فایل‌های یک مسیر (حذف مجازی پوشه)
 */
export async function deleteS3Folder(folder: string, id: string): Promise<void> {
    const prefix = `${folder}/${id}/`;

    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: prefix,
        });

        const listResponse = await s3.send(listCommand);
        const objects = listResponse.Contents;

        if (!objects || objects.length === 0) return;

        await deleteS3Objects(objects.map(obj => obj.Key!).filter(k => !!k));
    } catch (error) {
        console.error(`Error deleting S3 folder ${prefix}:`, error);
    }
}

/**
 * تابع کمکی برای حذف تمامی تصاویر یک محصول (جهت سازگاری با ایمپورت‌های محصولات)
 */
export async function deleteProductImages(productId: string): Promise<void> {
    await deleteS3Folder('products', productId);
}

/**
 * تبدیل Key به URL کامل برای نمایش
 */
export function getPublicImageUrl(key: string | null | undefined): string {
    if (!key) return '/logo/logo.png';
    if (key.startsWith('http')) return key;
    if (key.startsWith('/')) {
        // اگر آدرس یک تصویر محلی است که وجود ندارد، تصویر پیش‌فرض را برگردان
        return key;
    }

    // اگر آدرس لیارا ست نشده باشد، فقط کلید را برمی‌گرداند (جلوگیری از URL نامعتبر)
    if (!PUBLIC_URL) {
        console.warn('Warning: NEXT_PUBLIC_LIARA_URL is not defined in environment variables.');
        return key;
    }

    // حذف کوتیشن‌های احتمالی از آدرس استوریج
    const cleanPublicUrl = PUBLIC_URL.replace(/['"]/g, '');

    // اطمینان از اینکه Key با اسلش شروع نمی‌شود
    const cleanKey = key.startsWith('/') ? key.substring(1) : key;

    return `${cleanPublicUrl}/${cleanKey}`;
}

/**
 * توابع سازگاری (Compatibility)
 */
export async function uploadImage(file: File, folder: string = "uploads") {
    const res = await uploadSystemImage('settings', file);
    return res;
}
export async function deleteImage(fileUrlOrKey: string) {
    if (!fileUrlOrKey) return;
    const key = fileUrlOrKey.startsWith('http')
        ? fileUrlOrKey.replace(`${PUBLIC_URL}/`, "")
        : fileUrlOrKey.replace(/^\//, "");
    await deleteS3Object(key);
}
export async function deleteFolder(id: string, type: 'product' | 'post' = 'product') {
    await deleteS3Folder(type === 'post' ? 'posts' : 'products', id);
    return { success: true };
}
export async function deleteFile(relativeUrl: string) {
    await deleteImage(relativeUrl);
}
