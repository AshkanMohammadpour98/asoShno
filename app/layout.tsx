import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { getLocalSettings } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CartProvider } from "@/components/providers/CartProvider";

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

  // آدرس پایه سایت را بر اساس متغیر محیطی تعیین می‌کنیم.
  // در حالت لوکال، از مقدار موجود در فایل .env استفاده می‌شود (http://localhost:3000)
  // در لیارا، این مقدار برابر آدرس آنلاین شما خواهد بود.
  const baseUrl = process.env.NEXTAUTH_URL || "https://asoshno.liara.run";

  return {
    title: {
      template: `%s | ${settings.general.siteName}`,
      default: settings.general.siteTitle,
    },
    description: settings.general.siteDescription,
    keywords: settings.general.siteKeywords?.split(",").map(k => k.trim()) || [],
    authors: [{ name: settings.general.siteName }],
    metadataBase: new URL(baseUrl),
    icons: {
      icon: settings.general.logo || "/logo/logo.png",
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
  const session = await auth();

  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazir.variable} ${estedad.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-vazir bg-background text-foreground transition-colors duration-300">
        <CartProvider>
          <Navbar settings={settings} session={session} />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <BottomNavigation />
        </CartProvider>
      </body>
    </html>
  );
}
