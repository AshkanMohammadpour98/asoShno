"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { SiteSettings } from '@/lib/types';
import { getPublicImageUrl } from '@/lib/upload-image';

interface HeroProps {
  settings: SiteSettings;
}

const Hero = ({ settings }: HeroProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10,
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-secondary">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          <div className="lg:col-span-7 text-center lg:text-right">
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
              <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                ۲۵ سال تخصص فنی
              </span>
              <span className="px-4 py-1.5 rounded-full bg-background border border-border text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                Direct Import 🇦🇪
              </span>
            </div>

            <h1 className="text-6xl sm:text-7xl xl:text-8xl font-black leading-[1.3] tracking-tight mb-8 text-foreground whitespace-pre-line">
              {settings.home.heroTitle.split('لپ‌تاپ‌های حرفه‌ای').map((part, index, array) => (
                <React.Fragment key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <span className="gradient-text">لپ‌تاپ‌های حرفه‌ای</span>
                  )}
                </React.Fragment>
              ))}
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mr-0 mb-12 font-medium">
              {settings.home.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5">
              <Link href={settings.home.heroButtonLink} className="h-16 px-12 rounded-2xl bg-primary text-primary-foreground text-lg font-black shadow-lg shadow-primary/20 hover:translate-y-[-4px] transition-all flex items-center justify-center">{settings.home.heroButtonText}</Link>
              <Link href="/repair" className="h-16 px-12 rounded-2xl border border-border text-foreground text-lg font-black hover:bg-background hover:shadow-md transition-all flex items-center justify-center bg-transparent">خدمات تعمیرات</Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center items-center relative">
             <div
               className="relative w-full max-w-[550px] transition-transform duration-500 ease-out"
               style={{ transform: `perspective(2000px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x * -1}deg)` }}
             >
                <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden border-[12px] border-background shadow-2xl transition-all duration-700">
                   <Image
                     src={getPublicImageUrl(settings.home.heroImage)}
                     alt={settings.general.siteName}
                     fill
                     className="object-cover scale-110"
                     priority
                     sizes="(max-width: 1024px) 100vw, 500px"
                   />
                   <div className="absolute inset-0 bg-linear-to-t from-foreground/20 via-transparent to-transparent"></div>
                </div>

                {/* Floating Badges */}
                <div className="absolute -left-8 top-1/4 bg-background/90 backdrop-blur-md border border-border p-6 rounded-3xl shadow-xl animate-float">
                   <span className="text-4xl">🇦🇪</span>
                   <p className="text-[10px] font-black text-primary uppercase mt-2">Direct</p>
                </div>
                <div className="absolute -right-8 bottom-1/4 bg-primary p-6 rounded-3xl shadow-xl animate-float [animation-delay:1.5s]">
                   <span className="text-white text-3xl font-black">25</span>
                   <p className="text-[10px] font-bold text-white/80 uppercase">Trust</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
