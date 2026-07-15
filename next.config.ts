import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // غیرفعال کردن بهینه‌سازی خودکار تصاویر برای حل قطعی مشکل ۴۰۰ و ۵۰۰ در لیارا
    // این کار باعث می‌شود تصاویر مستقیماً از آدرس استوریج بارگذاری شوند
    unoptimized: true,

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aso-shno-storage.storage.c2.liara.site',
      },
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
        hostname: 'storage.iran.liara.space',
      },
    ],
  },
};

export default nextConfig;
