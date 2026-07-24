import { MetadataRoute } from 'next';
import { getLocalSettings } from '@/lib/db';
import { getPublicImageUrl } from '@/lib/upload-image';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getLocalSettings();

  const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  // Remove quotes and trailing slash
  const baseUrl = rawBaseUrl.replace(/['"]/g, '').replace(/\/$/, '');

  const getIconUrl = (path: string | undefined, fallback: string) => {
    if (!path) return `${baseUrl}${fallback}`;
    const proxyPath = getPublicImageUrl(path);
    return `${baseUrl}${proxyPath}`;
  };

  return {
    name: settings.general.siteName || 'آسو شنو',
    short_name: settings.general.siteName || 'آسو شنو',
    description: settings.general.siteDescription || 'فروشگاه تخصصی لپ‌تاپ و قطعات کامپیوتر آسو شنو',
    lang: 'fa',
    dir: 'rtl',
    start_url: `${baseUrl}/`,
    display: 'standalone',
    orientation: 'natural',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: getIconUrl(settings.general.favicon, '/favicon.ico'),
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: getIconUrl(settings.general.logo, '/logo/logo.png'),
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: getIconUrl(settings.general.pwaLogo, '/logo/main-logo.png'),
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
