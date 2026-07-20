import { MetadataRoute } from 'next';
import { getLocalSettings } from '@/lib/db';
import { getPublicImageUrl } from '@/lib/upload-image';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getLocalSettings();

  const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const baseUrl = rawBaseUrl.replace(/['"]/g, '');

  return {
    name: settings.general.siteName || 'آسو شنو',
    short_name: settings.general.siteName || 'آسو شنو',
    description: settings.general.siteDescription || 'فروشگاه تخصصی لپ‌تاپ و قطعات کامپیوتر آسو شنو',
    lang: 'fa',
    dir: 'rtl',
    start_url: baseUrl,
    display: 'standalone',
    orientation: 'natural',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: settings.general.favicon ? `${baseUrl}${getPublicImageUrl(settings.general.favicon)}` : `${baseUrl}/favicon.ico`,
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: settings.general.logo ? `${baseUrl}${getPublicImageUrl(settings.general.logo)}` : `${baseUrl}/logo/logo.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: settings.general.pwaLogo ? `${baseUrl}${getPublicImageUrl(settings.general.pwaLogo)}` : `${baseUrl}/logo/main-logo.png`,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
