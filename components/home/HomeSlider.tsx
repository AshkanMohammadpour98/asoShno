"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade, Keyboard, A11y } from 'swiper/modules';
import { getPublicImageUrl } from '@/lib/upload-image';
import type { HomeSlide } from '@/lib/types';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/a11y';

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
    <div className="relative w-full h-full group" dir="rtl">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade, Keyboard, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        loop={slides.length > 1}
        keyboard={{ enabled: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          el: '.custom-pagination',
        }}
        navigation={{
          nextEl: '.slider-next',
          prevEl: '.slider-prev',
        }}
        className="h-full rounded-[2rem] lg:rounded-[3rem] shadow-2xl overflow-hidden border-8 lg:border-[12px] border-background/50 backdrop-blur-sm"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Desktop Image */}
              <div className="hidden lg:block relative w-full h-full">
                <Image
                  src={getPublicImageUrl(slide.image)}
                  alt={slide.title || ""}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 800px"
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
                  sizes="100vw"
                />
              </div>

              {/* Slide Content Overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 pb-16 sm:pb-20 lg:p-12 lg:pb-24"
                style={{ color: '#ffffff' }}
              >
                {slide.title && (
                   <h3 className="text-xl lg:text-3xl font-black mb-2 animate-fade-up">{slide.title}</h3>
                )}
                {slide.subtitle && (
                   <p className="text-xs lg:text-base font-bold mb-6 line-clamp-2 max-w-md animate-fade-up [animation-delay:200ms] text-white/80">{slide.subtitle}</p>
                )}
                {slide.ctaText && slide.link && (
                  <Link
                    href={slide.link}
                    className="self-start h-12 lg:h-14 px-8 rounded-xl text-white text-xs lg:text-sm font-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30 animate-fade-up [animation-delay:400ms]"
                    style={{ backgroundColor: slide.buttonColor || '#4f46e5' }}
                  >
                    {slide.ctaText}
                  </Link>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows (Vertically Centered at Sides) */}
      <button className="slider-prev absolute right-6 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:border-primary shadow-xl">
        <FiChevronRight className="text-xl sm:text-2xl" />
      </button>

      <button className="slider-next absolute left-6 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:border-primary shadow-xl">
        <FiChevronLeft className="text-xl sm:text-2xl" />
      </button>

      {/* Pagination Dots (Centered at Bottom) */}
      <div className="custom-pagination absolute z-20 flex justify-center items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 hover:bg-black/30 transition-all duration-300"></div>

      <style jsx global>{`
        .custom-pagination.swiper-pagination-horizontal.swiper-pagination-bullets {
          width: fit-content !important;
          min-width: 50px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          bottom: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 6px 12px !important;
        }

        .custom-pagination .swiper-pagination-bullet {
          margin: 0 3px !important;
          background: rgba(255, 255, 255, 0.25) !important;
          opacity: 1 !important;
          width: 6px !important;
          height: 6px !important;
          border-radius: 50% !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: pointer !important;
        }

        .custom-pagination .swiper-pagination-bullet-active {
          background: #ffffff !important;
          width: 20px !important;
          border-radius: 10px !important;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.2) !important;
        }

        @media (max-width: 640px) {
          .custom-pagination.swiper-pagination-horizontal.swiper-pagination-bullets {
            bottom: 24px !important;
            padding: 4px 10px !important;
          }
          .custom-pagination .swiper-pagination-bullet {
            width: 5px !important;
            height: 5px !important;
            margin: 0 2px !important;
          }
          .custom-pagination .swiper-pagination-bullet-active {
            width: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeSlider;
