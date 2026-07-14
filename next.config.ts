import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // افزایش محدودیت حجم پردازش تصاویر (اختیاری)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.liara.site',
      },
      {
        protocol: 'https',
        hostname: '**.liara.space',
      },
      {
        protocol: 'https',
        hostname: '**.arvanstorage.ir',
      },
      {
        protocol: 'https',
        hostname: 'storage.c2.liara.site',
      },
      {
        protocol: 'https',
        hostname: 'aso-shno-storage.storage.c2.liara.site',
      },
    ],
    // غیرفعال کردن موقت بهینه‌سازی در صورت تداوم مشکل (به عنوان آخرین راه حل)
    // unoptimized: true,
  },
};

export default nextConfig;
