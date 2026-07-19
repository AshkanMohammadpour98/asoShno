import { MetadataRoute } from 'next';
import { getLocalSettings } from '@/lib/db';
import { getPublicImageUrl } from '@/lib/upload-image';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getLocalSettings();

  return {
    name: settings.general.siteName || 'آسو شنو',
    short_name: settings.general.siteName || 'آسو شنو',
    description: settings.general.siteDescription || 'فروشگاه تخصصی لپ‌تاپ و قطعات کامپیوتر آسو شنو',
    lang: 'fa',
    dir: 'rtl',
    start_url: '/',
    display: 'standalone',
    orientation: 'natural',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: settings.general.favicon ? getPublicImageUrl(settings.general.favicon) : '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: settings.general.logo ? getPublicImageUrl(settings.general.logo) : '/logo/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: settings.general.pwaLogo ? getPublicImageUrl(settings.general.pwaLogo) : '/logo/main-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
