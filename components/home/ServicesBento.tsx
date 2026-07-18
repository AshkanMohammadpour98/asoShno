import React from 'react';
import Image from 'next/image';
import type { SiteSettings } from '@/lib/types';
import { getPublicImageUrl } from '@/lib/upload-image';

interface ServicesBentoProps {
  settings: SiteSettings;
}

const ServicesBento = ({ settings }: ServicesBentoProps) => {
  const services = settings.home.services;

  return (
    <section className="py-12 sm:py-24 relative overflow-hidden bg-background transition-colors duration-300">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 text-right" dir="rtl">
        <div className="mb-12 sm:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl text-center md:text-right">
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              {settings.home.servicesTitle.split('آسو شنو').map((part, index, array) => (
                <React.Fragment key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <span className="gradient-text">آسو شنو</span>
                  )}
                </React.Fragment>
              ))}
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-xl text-muted-foreground font-medium leading-relaxed opacity-80">
              {settings.home.servicesSubtitle}
            </p>
          </div>
          <div className="flex justify-center gap-4 sm:gap-6">
             <div className="group text-center px-6 sm:px-8 py-3 sm:py-4 rounded-3xl bg-card border border-border shadow-sm transition-all hover:border-primary/30">
                <p className="text-2xl sm:text-3xl font-black text-primary leading-none group-hover:scale-110 transition-transform">25+</p>
                <p className="text-[9px] sm:text-[11px] font-bold text-muted-foreground mt-2 uppercase tracking-[0.2em]">Years Experience</p>
             </div>
             <div className="group text-center px-6 sm:px-8 py-3 sm:py-4 rounded-3xl bg-card border border-border shadow-sm transition-all hover:border-primary/30">
                <p className="text-2xl sm:text-3xl font-black text-primary leading-none group-hover:scale-110 transition-transform">10k+</p>
                <p className="text-[9px] sm:text-[11px] font-bold text-muted-foreground mt-2 uppercase tracking-[0.2em]">Happy Clients</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3 md:grid-rows-3 px-2 sm:px-0">
          {services.map((service, index) => {
            const className = service.className || (index === 0 ? "md:col-span-2 md:row-span-2 bg-primary text-primary-foreground border-none shadow-primary/10" : "bg-card border-border text-foreground");
            const isPrimaryCard = className.includes('bg-primary');
            const hasImage = !!service.image;

            return (
              <div
                key={index}
                className={`bento-card group flex flex-col justify-end min-h-[280px] sm:min-h-[320px] p-8 sm:p-12 shadow-sm relative overflow-hidden border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 ${className}`}
              >
                {/* Micro-dot background pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]"></div>

                {hasImage && (
                  <>
                    {/* Dynamic Glow Layer */}
                    <div className={`absolute pointer-events-none transition-all duration-1000 blur-[80px] rounded-full opacity-0 group-hover:opacity-60 ${
                      index === 0
                        ? "-left-10 -bottom-10 w-full h-full bg-white/20"
                        : "-left-20 -bottom-20 w-full h-full bg-primary/20"
                    }`}></div>

                    <div className={`absolute pointer-events-none transition-all duration-1000 group-hover:scale-110 group-hover:rotate-[-2deg] ${
                      index === 0
                        ? "-left-24 -bottom-12 w-[90%] h-[90%] rotate-[-12deg] z-10"
                        : "-left-16 -bottom-24 w-[65%] h-[140%] rotate-[-8deg] z-10"
                    }`}>
                      <Image
                        src={getPublicImageUrl(service.image!)}
                        alt={service.title}
                        fill
                        className="object-contain object-left-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                      />
                    </div>
                  </>
                )}

                {/* Content Overlay for better readability over images */}
                <div className="absolute inset-0 bg-linear-to-t from-black/5 via-transparent to-transparent pointer-events-none"></div>

                <div className="absolute top-8 right-8 sm:top-10 sm:right-10 text-5xl sm:text-6xl group-hover:translate-y-[-5px] transition-transform duration-500 ease-out z-20 opacity-80 group-hover:opacity-100">
                  {service.icon}
                </div>

                {service.badge && (
                  <div className="absolute top-8 left-8 sm:top-10 sm:left-10 z-20">
                    <span className="bg-white/10 backdrop-blur-xl text-white text-[9px] sm:text-[11px] font-black px-4 py-2 rounded-2xl border border-white/20 uppercase tracking-[0.15em] shadow-2xl">
                      {service.badge}
                    </span>
                  </div>
                )}

                <div className="relative z-20 space-y-4">
                  <h3 className={`text-2xl sm:text-4xl font-black leading-[1.1] ${isPrimaryCard ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {service.title}
                  </h3>
                  <p className={`text-sm sm:text-lg leading-relaxed max-w-[320px] font-medium transition-colors ${isPrimaryCard ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesBento;
