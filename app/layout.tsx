import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNavigation from "@/components/layout/BottomNavigation";
import AnnouncementDisplay from "@/components/layout/AnnouncementDisplay";
import { getLocalSettings, getLocalCategories } from "@/lib/db";
import { getPublicImageUrl } from "@/lib/upload-image";
import { auth } from "@/lib/auth";
import { CartProvider } from "@/components/providers/CartProvider";
import ConnectivityGuard from "@/components/layout/ConnectivityGuard";
import PWARegister from "@/components/layout/PWARegister";
import InstallPrompt from "@/components/layout/InstallPrompt";

const vazir = localFont({
  src: "../public/fonts/Vazirmatn/Vazirmatn[wght].woff2",
  variable: "--font-vazir",
  display: 'swap',
});

const estedad = localFont({
  src: "../public/fonts/Estedad/Estedad[wght].woff2",
  variable: "--font-estedad",
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLocalSettings();

  // آدرس پایه سایت را از متغیر محیطی می‌خوانیم.
  // حذف کوتیشن‌های احتمالی برای جلوگیری از خطای ERR_INVALID_URL در محیط‌هایی مثل لیارا
  const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const baseUrl = rawBaseUrl.replace(/['"]/g, '');

  return {
    title: {
      template: `%s | ${settings.general.siteName}`,
      default: settings.general.siteTitle,
    },
    description: settings.general.siteDescription,
    keywords: settings.general.siteKeywords?.split(",").map(k => k.trim()) || [],
    authors: [{ name: settings.general.siteName }],
    metadataBase: new URL(baseUrl),
    manifest: '/manifest.ts',
    icons: {
      icon: settings.general.favicon ? getPublicImageUrl(settings.general.favicon) : "/favicon.ico",
      apple: settings.general.pwaLogo ? getPublicImageUrl(settings.general.pwaLogo) : "/logo/logo.png",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: settings.general.siteName,
    },
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      title: settings.general.siteTitle,
      description: settings.general.siteDescription,
      url: baseUrl,
      siteName: settings.general.siteName,
      images: [{ url: "/logo/main-logo.png" }],
      locale: "fa_IR",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getLocalSettings();
  const categories = await getLocalCategories();
  const session = await auth();

  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazir.variable} ${estedad.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-vazir bg-background text-foreground transition-colors duration-300">
        <PWARegister />
        <InstallPrompt />
        <ConnectivityGuard />
        <AnnouncementDisplay />
        <CartProvider>
          <Navbar settings={settings} session={session} />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} categories={categories} />
          <BottomNavigation session={session} />
        </CartProvider>
      </body>
    </html>
  );
}
