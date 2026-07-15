import { PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./s3";
import crypto from "crypto";
import { cache } from 'react';

/**
 * پیکربندی متغیرهای محیطی S3
 */
const BUCKET_NAME = process.env.LIARA_BUCKET_NAME;
const PUBLIC_URL = process.env.NEXT_PUBLIC_LIARA_URL;

/**
 * تولید آدرس موقت (Signed URL) برای نمایش تصاویر از باکت خصوصی یا دارای محدودیت دامنه
 * از cache استفاده می‌کنیم تا در یک درخواست واحد، برای یک تصویر چند بار تابع صدا زده نشود
 */
export const getSignedImageUrl = cache(async (key: string | null | undefined): Promise<string> => {
    if (!key) return '/logo/logo.png';
    if (typeof key !== 'string') return '/logo/logo.png';
    if (key.startsWith('http')) return key;
    if (key.startsWith('/')) return key;

    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key.startsWith('/') ? key.substring(1) : key,
        });

        // تولید لینک با اعتبار ۷ روز (حداکثر مقدار مجاز S3)
        // این لینک شامل امضای امنیتی است و محدودیت دامنه لیارا را دور می‌زند
        return await getSignedUrl(s3, command, { expiresIn: 604800 });
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return '/logo/logo.png';
    }
});

/**
 * تبدیل Key به URL برای نمایش
 * نکته: در لیارا به دلیل محدودیت دامنه‌های پیش‌فرض، آدرس‌های مستقیم کار نمی‌کنند.
 * این تابع به عنوان یک واسط (Proxy) عمل می‌کند تا لینک‌های امضا شده تولید شوند.
 */
export function getPublicImageUrl(key: string | null | undefined): string {
    if (!key) return '/logo/logo.png';
    if (typeof key !== 'string') return '/logo/logo.png';
    if (key.startsWith('http')) return key;
    if (key.startsWith('/')) return key;

    // هدایت به API Proxy برای تولید لینک امضا شده به صورت داینامیک
    return `/api/image-proxy?key=${encodeURIComponent(key)}`;
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
