"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { SiteSettings, LocalCategory } from '@/lib/types';
import { getPublicImageUrl } from '@/lib/upload-image';

const Footer = ({ settings, categories }: { settings: SiteSettings, categories: LocalCategory[] }) => {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="relative border-t bg-secondary pt-16 pb-8 overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-border to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10 text-right">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12 lg:mb-16">

          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-4 space-y-6 lg:space-y-8">
            <Link href="/" className="flex items-center gap-3 lg:gap-4 group">
              <div className="relative h-12 w-12 lg:h-14 lg:w-14 overflow-hidden rounded-xl lg:rounded-2xl bg-card border border-border transition-transform group-hover:scale-105">
                <Image
                  src={getPublicImageUrl(settings.general.logo)}
                  alt={settings.general.siteName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl lg:text-2xl font-bold font-estedad gradient-text leading-tight">{settings.general.siteName}</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{settings.general.siteName} Laptops</span>
              </div>
            </Link>

            <p className="text-muted-foreground leading-relaxed text-xs lg:text-sm max-w-sm font-medium">
              {settings.footer.aboutText}
            </p>

            <div className="flex items-center gap-3">
              <Link href={`https://instagram.com/${settings.contact.instagram}`} className="h-10 w-10 lg:h-11 lg:w-11 rounded-xl lg:rounded-2xl bg-muted border border-border flex items-center justify-center text-lg transition-all hover:bg-pink-600 hover:text-white hover:-translate-y-1 shadow-sm">📸</Link>
              <Link href={`https://t.me/${settings.contact.telegram}`} className="h-10 w-10 lg:h-11 lg:w-11 rounded-xl lg:rounded-2xl bg-muted border border-border flex items-center justify-center text-lg transition-all hover:bg-blue-500 hover:text-white hover:-translate-y-1 shadow-sm">✈️</Link>
              <Link href={`https://wa.me/${settings.contact.whatsapp}`} className="h-10 w-10 lg:h-11 lg:w-11 rounded-xl lg:rounded-2xl bg-muted border border-border flex items-center justify-center text-lg transition-all hover:bg-emerald-500 hover:text-white hover:-translate-y-1 shadow-sm">💬</Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 lg:col-span-2 space-y-6 lg:space-y-8">
            <h4 className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-foreground border-r-4 border-primary pr-3">فروشگاه</h4>
            <ul className="space-y-3 lg:space-y-4 text-[11px] lg:text-sm font-bold text-muted-foreground pr-4">
              {categories.slice(0, 4).map(cat => (
                <li key={cat.id}>
                  <Link href={`/shop?category=${cat.id}`} className="hover:text-primary transition-colors">{cat.name}</Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li><Link href="/shop" className="hover:text-primary transition-colors">مشاهده ویترین</Link></li>
              )}
            </ul>
          </div>

          <div className="col-span-1 lg:col-span-2 space-y-6 lg:space-y-8">
            <h4 className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-foreground border-r-4 border-primary pr-3">خدمات</h4>
            <ul className="space-y-3 lg:space-y-4 text-[11px] lg:text-sm font-bold text-muted-foreground pr-4">
              <li><Link href="/repair" className="hover:text-primary transition-colors">ثبت تعمیر</Link></li>
              <li><Link href="/track" className="hover:text-primary transition-colors">رهگیری قطعه</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">مجله خبری</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">درباره ما</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="col-span-2 lg:col-span-4 space-y-6 lg:space-y-8 lg:pr-10">
            <h4 className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-foreground border-r-4 border-primary pr-3">ارتباط با ما</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 pr-4">
              <div className="flex gap-4">
                <span className="text-xl">📍</span>
                <p className="text-[11px] lg:text-xs leading-relaxed text-muted-foreground font-bold">
                  {settings.contact.address}
                </p>
              </div>
              <div className="flex gap-4">
                <span className="text-xl">📞</span>
                <div className="flex flex-col gap-2">
                  <Link href={`tel:${settings.contact.phone}`} className="text-xs lg:text-sm font-black dir-ltr text-right hover:text-primary transition-colors">{settings.contact.phone}</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 lg:gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="h-12 w-10 lg:h-16 lg:w-14 bg-muted border border-border rounded-xl flex items-center justify-center text-[7px] lg:text-[8px] font-black text-center p-1 lg:p-2 leading-tight text-foreground">E-NAMAD<br/>TRUST</div>
             <div className="h-12 w-10 lg:h-16 lg:w-14 bg-muted border border-border rounded-xl flex items-center justify-center text-[7px] lg:text-[8px] font-black text-center p-1 lg:p-2 leading-tight text-foreground">SAMAN<br/>DEHI</div>
          </div>

          <p className="text-[9px] lg:text-[11px] font-black text-muted-foreground text-center md:text-right leading-loose uppercase tracking-widest">
            © {new Date().getFullYear()} {settings.general.siteName} Laptops. {settings.footer.copyright}<br/>
            <span className="text-[8px] lg:text-[9px] opacity-60">Handcrafted with precision for the tech community</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
