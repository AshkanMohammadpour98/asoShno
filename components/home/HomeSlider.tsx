"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { getPublicImageUrl } from '@/lib/upload-image';
import type { HomeSlide } from '@/lib/types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface HomeSliderProps {
  slides: HomeSlide[];
}

const HomeSlider = ({ slides }: HomeSliderProps) => {
  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-full min-h-[400px] bg-muted rounded-[3rem] flex items-center justify-center text-muted-foreground border-2 border-dashed border-border">
        <p className="font-black text-sm">اسلایدی برای نمایش وجود ندارد.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        loop={slides.length > 1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          el: '.custom-pagination',
          bulletClass: 'swiper-pagination-bullet !bg-primary/20 !w-3 !h-3 !opacity-100 !mx-1 transition-all duration-300',
          bulletActiveClass: 'swiper-pagination-bullet-active !bg-primary !w-8 !rounded-full',
        }}
        navigation={{
          nextEl: '.slider-next',
          prevEl: '.slider-prev',
        }}
        className="h-full rounded-[2.5rem] lg:rounded-[4rem] shadow-2xl overflow-hidden border-[10px] lg:border-[15px] border-background"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full aspect-[4/5] lg:aspect-auto">
              {/* Desktop Image */}
              <div className="hidden lg:block relative w-full h-full">
                <Image
                  src={getPublicImageUrl(slide.image)}
                  alt={slide.title || ""}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Mobile Image */}
              <div className="block lg:hidden relative w-full h-full">
                <Image
                  src={getPublicImageUrl(slide.mobileImage || slide.image)}
                  alt={slide.title || ""}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Slide Content Overlay (Optional internal overlay if desired) */}
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent flex flex-col justify-end p-8 lg:p-12 text-white">
                {slide.title && (
                   <h3 className="text-xl lg:text-3xl font-black mb-2 animate-fade-up">{slide.title}</h3>
                )}
                {slide.subtitle && (
                   <p className="text-xs lg:text-base font-bold text-white/80 mb-6 line-clamp-2 max-w-md animate-fade-up [animation-delay:200ms]">{slide.subtitle}</p>
                )}
                {slide.ctaText && slide.link && (
                  <Link
                    href={slide.link}
                    className="self-start h-12 lg:h-14 px-8 rounded-xl bg-primary text-white text-xs lg:text-sm font-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30 animate-fade-up [animation-delay:400ms]"
                  >
                    {slide.ctaText}
                  </Link>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons (Desktop Only) */}
      <button className="slider-prev absolute right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:border-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      <button className="slider-next absolute left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:border-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Custom Pagination Container */}
      <div className="custom-pagination absolute bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 z-20 flex justify-center"></div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          margin: 0 4px !important;
        }
        .swiper-button-disabled {
          opacity: 0 !important;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default HomeSlider;
