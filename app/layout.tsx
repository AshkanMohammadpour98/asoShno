import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { getLocalSettings } from "@/lib/db";

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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLocalSettings();

  return {
    title: {
      template: `%s | ${settings.general.siteName}`,
      default: settings.general.siteTitle,
    },
    description: settings.general.siteDescription,
    keywords: settings.general.siteKeywords?.split(",").map(k => k.trim()) || [],
    authors: [{ name: settings.general.siteName }],
    metadataBase: new URL("https://asoshno.ir"),
    icons: {
      icon: settings.general.logo || "/logo/logo.png",
    },
    openGraph: {
      title: settings.general.siteTitle,
      description: settings.general.siteDescription,
      url: "https://asoshno.ir",
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

  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazir.variable} ${estedad.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-vazir bg-background text-foreground transition-colors duration-300">
        <Navbar settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <BottomNavigation />
      </body>
    </html>
  );
}
