import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aso-shno-storage.storage.c2.liara.site',
      },
      {
        protocol: 'https',
        hostname: 'storage.c2.liara.site',
      },
      {
        protocol: 'https',
        hostname: '*.liara.site',
      },
      {
        protocol: 'https',
        hostname: '*.arvanstorage.ir',
      },
      {
        protocol: 'https',
        hostname: '**.liara.space',
      },
    ],
  },
};

export default nextConfig;
