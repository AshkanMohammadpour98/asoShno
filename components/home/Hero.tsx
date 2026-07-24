"use client";
import React from 'react';
import Link from 'next/link';
import type { SiteSettings, HomeSlide } from '@/lib/types';
import HomeSlider from './HomeSlider';
import { FiSearch } from 'react-icons/fi';

interface HeroProps {
  settings: SiteSettings;
  slides: HomeSlide[];
}

const Hero = ({ settings, slides }: HeroProps) => {
  const isStacked = settings.home.heroLayout === 'stacked';

  return (
    <section className={`relative z-0 flex flex-col justify-center bg-background transition-all overflow-hidden pt-4 lg:pt-0 min-h-[calc(100dvh-4rem)] lg:min-h-[calc(100dvh-6rem)]`}>
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/[0.03] blur-[150px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 py-8 lg:py-12">
        <div className={`grid gap-8 lg:gap-12 items-center ${isStacked ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>

          {/* Slider Side */}
          <div className={`${isStacked ? 'w-full order-2' : 'lg:col-span-6 order-2 lg:order-2'} flex items-center justify-center`}>
             <div className={`w-full relative ${isStacked ? 'h-[250px] sm:h-[400px] lg:h-[650px]' : 'h-[350px] lg:h-[650px]'}`}>
                <HomeSlider slides={slides} />
             </div>
          </div>

          {/* Content Side */}
          <div className={`${isStacked ? 'w-full order-1' : 'lg:col-span-6 order-1 lg:order-1 flex flex-col justify-center'}`}>
            <div className={`flex flex-col ${isStacked ? 'lg:flex-row lg:items-end lg:justify-between gap-8' : 'items-center lg:items-start text-center lg:text-right'}`}>

              {/* Text Part */}
              <div className={`flex flex-col ${isStacked ? 'items-center lg:items-start text-center lg:text-right flex-1' : 'items-center lg:items-start text-center lg:text-right'}`}>
                <div className={`flex flex-wrap gap-3 mb-8 ${isStacked ? 'justify-center lg:justify-start' : 'justify-center lg:justify-start'}`}>
                  <span className="px-5 py-2 rounded-2xl bg-primary/5 text-primary text-[11px] font-black uppercase tracking-wider border border-primary/10 backdrop-blur-sm">
                    ۲۵ سال تخصص فنی
                  </span>
                  <span className="px-5 py-2 rounded-2xl bg-foreground/[0.03] border border-border/50 text-muted-foreground text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                    Direct Import 🇦🇪
                  </span>
                </div>

                <h1 className={`${isStacked ? 'text-4xl sm:text-5xl lg:text-7xl' : 'text-4xl sm:text-6xl xl:text-[5.5rem]'} font-black leading-[1.05] tracking-tight mb-8 text-foreground w-full`}>
                  {settings.home.heroTitle.split('لپ‌تاپ‌های حرفه‌ای').map((part, index, array) => (
                    <React.Fragment key={index}>
                      {part}
                      {index < array.length - 1 && (
                        <span className="gradient-text block lg:inline-block">لپ‌تاپ‌های حرفه‌ای</span>
                      )}
                    </React.Fragment>
                  ))}
                </h1>

                <p className="text-base lg:text-xl text-muted-foreground/80 leading-relaxed max-w-xl mb-10 font-medium">
                  {settings.home.heroSubtitle}
                </p>

                {!isStacked && (
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center lg:justify-start w-full">
                    <Link href={settings.home.heroButtonLink} className="h-14 sm:h-16 px-10 sm:px-14 rounded-2xl bg-primary text-primary-foreground text-sm sm:text-lg font-black shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:translate-y-[-4px] transition-all flex items-center justify-center">{settings.home.heroButtonText}</Link>
                    <Link href="/repair" className="h-14 sm:h-16 px-10 sm:px-14 rounded-2xl border-2 border-border text-foreground text-sm sm:text-lg font-black hover:bg-muted/50 hover:translate-y-[-4px] transition-all flex items-center justify-center bg-transparent">خدمات تعمیرات</Link>
                  </div>
                )}
              </div>

              {/* Search & Buttons Part (Only for Stacked Desktop) */}
              {isStacked && (
                <div className="flex flex-col items-center lg:items-end gap-6 flex-1 w-full max-w-xl mx-auto lg:mx-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const query = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
                      if (query.trim()) window.location.href = `/shop?search=${encodeURIComponent(query)}`;
                    }}
                    className="relative group h-14 sm:h-18 w-full"
                  >
                    <input
                      name="q"
                      type="text"
                      placeholder="جستجوی هوشمند قطعات و لپ‌تاپ..."
                      className="w-full h-full bg-muted/30 backdrop-blur-2xl border-2 border-border/50 rounded-2xl pr-14 pl-24 sm:pl-36 text-xs sm:text-base font-bold focus:border-primary focus:bg-background transition-all outline-none shadow-sm"
                      dir="rtl"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-primary/40 group-focus-within:text-primary transition-colors">
                      <FiSearch />
                    </span>
                    <button
                      type="submit"
                      className="absolute left-2 top-2 bottom-2 px-6 sm:px-10 rounded-xl bg-primary text-primary-foreground text-[10px] sm:text-sm font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg"
                    >
                      جستجو
                    </button>
                  </form>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:justify-end">
                    <Link href={settings.home.heroButtonLink} className="h-14 lg:h-16 px-8 rounded-2xl bg-primary text-primary-foreground text-sm font-black shadow-lg shadow-primary/20 hover:translate-y-[-4px] transition-all flex items-center justify-center flex-1 lg:flex-none lg:min-w-[200px]">{settings.home.heroButtonText}</Link>
                    <Link href="/repair" className="h-14 lg:h-16 px-8 rounded-2xl border-2 border-border text-foreground text-sm font-black hover:bg-muted/50 hover:translate-y-[-4px] transition-all flex items-center justify-center bg-transparent flex-1 lg:flex-none lg:min-w-[200px]">خدمات تعمیرات</Link>
                  </div>
                </div>
              )}

              {/* Search Part (Only for Side-by-Side Desktop) */}
              {!isStacked && (
                <div className="w-full max-w-2xl mb-10 px-2 sm:px-0 mx-auto lg:mr-0 mt-12 hidden lg:block">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const query = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
                      if (query.trim()) window.location.href = `/shop?search=${encodeURIComponent(query)}`;
                    }}
                    className="relative group h-18"
                  >
                    <input
                      name="q"
                      type="text"
                      placeholder="جستجوی هوشمند قطعات و لپ‌تاپ..."
                      className="w-full h-full bg-muted/30 backdrop-blur-2xl border-2 border-border/50 rounded-3xl pr-16 pl-40 text-lg font-bold focus:border-primary focus:bg-background transition-all outline-none shadow-sm"
                      dir="rtl"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl text-primary/40 group-focus-within:text-primary transition-colors">
                      <FiSearch />
                    </span>
                    <button
                      type="submit"
                      className="absolute left-2.5 top-2.5 bottom-2.5 px-10 rounded-2xl bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                      جستجو
                    </button>
                  </form>
                </div>
              )}

              {/* Mobile Search (Only for Side-by-Side) */}
              {!isStacked && (
                <div className="w-full max-w-xl mb-10 px-2 sm:px-0 mx-auto mt-10 lg:hidden">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const query = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
                      if (query.trim()) window.location.href = `/shop?search=${encodeURIComponent(query)}`;
                    }}
                    className="relative group h-14 w-full"
                  >
                    <input
                      name="q"
                      type="text"
                      placeholder="جستجوی قطعات و لپ‌تاپ..."
                      className="w-full h-full bg-muted/50 backdrop-blur-xl border-2 border-border/50 rounded-2xl pr-14 pl-24 text-sm font-bold focus:border-primary focus:bg-background transition-all outline-none shadow-sm"
                      dir="rtl"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-primary/40 group-focus-within:text-primary transition-colors">
                      <FiSearch />
                    </span>
                    <button
                      type="submit"
                      className="absolute left-2 top-2 bottom-2 px-5 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                    >
                      جستجو
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
