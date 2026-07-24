import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'storage.c2.liara.space' },
      { protocol: 'https', hostname: 'storage.c2.liara.site' },
      { protocol: 'https', hostname: 'aso-shno-storage.storage.c2.liara.site' },
      { protocol: 'https', hostname: '**.liara.site' },
      { protocol: 'https', hostname: '**.liara.space' },
      { protocol: 'https', hostname: 'storage.iran.liara.space' },
    ],
  },
};

export default nextConfig;
