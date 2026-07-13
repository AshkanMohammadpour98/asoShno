"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import CartDrawer from './CartDrawer';
import SearchModal from './SearchModal';
import ThemeToggle from './ThemeToggle';
import { useCart } from '../providers/CartProvider';
import type { SiteSettings } from '@/lib/types';
import { getPublicImageUrl } from '@/lib/upload-image';

const navLinks = [
  { name: 'فروشگاه', href: '/shop' },
  { name: 'تعمیرات', href: '/repair' },
  { name: 'رهگیری', href: '/track' },
  { name: 'مجله', href: '/blog' },
  { name: 'درباره ما', href: '/about' },
  { name: 'تماس با ما', href: '/contact' },
];

const Navbar = ({ settings, session }: { settings: SiteSettings, session: any }) => {
  const { totalCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const user = session?.user;
  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled ? 'h-16 glass-effect shadow-md' : 'h-24 bg-transparent border-transparent'
      }`}>
        <div className="container mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-xl bg-primary/5 transition-transform group-hover:scale-105 border border-primary/10">
                <Image
                  src={getPublicImageUrl(settings.general.logo)}
                  alt={settings.general.siteName}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 40px, 48px"
                />
              </div>
              <div className={`hidden sm:flex flex-col leading-tight transition-all duration-500 ${scrolled ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100'}`}>
                <span className="text-xl font-bold font-estedad gradient-text">{settings.general.siteName}</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Premium Tech Hub</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-foreground/70 hover:text-primary transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsSearchOpen(true)} className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-all border border-border/50">🔍</button>
            <ThemeToggle />
            <button onClick={() => setIsCartOpen(true)} className="relative h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-all border border-border/50">
              🛒 <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[8px] font-bold text-white flex items-center justify-center border-2 border-background">{totalCount}</span>
            </button>
            <div className="hidden md:block h-6 w-px bg-border mx-1"></div>

            {isLoggedIn ? (
              <Link
                href={isAdmin ? "/admin" : "/profile"}
                className="hidden md:flex h-10 items-center px-6 rounded-xl bg-secondary text-foreground text-xs font-black border border-border hover:bg-muted transition-all gap-2"
              >
                <span>{isAdmin ? 'پنل مدیریت' : 'حساب کاربری'}</span>
                <span className="text-lg">👤</span>
              </Link>
            ) : (
              <Link href="/login" className="hidden md:flex h-10 items-center px-6 rounded-xl bg-foreground text-background text-xs font-black hover:scale-105 transition-all">ورود</Link>
            )}

            <Link href="/repair" className="inline-flex h-10 items-center px-6 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all">ثبت تعمیر</Link>
          </div>
        </div>
      </nav>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
