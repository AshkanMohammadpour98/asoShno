"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductDetailPage() {
  const [activeImage, setActiveImage] = useState(0);

  const product = {
    name: "MacBook Pro M3 Max",
    brand: "Apple",
    price: "۱۸۵,۰۰۰,۰۰۰",
    category: "لپ‌تاپ",
    specs: {
      "پردازنده": "M3 Max (14-Core CPU)",
      "رم": "36GB Unified Memory",
      "حافظه": "1TB SSD SuperFast",
      "گرافیک": "30-Core GPU",
      "صفحه نمایش": "14.2-inch Liquid Retina XDR",
      "باتری": "سلامت ۱۰۰٪ (فقط ۲۰ سیکل)",
      "سال ساخت": "۲۰۲۴",
      "رنگ": "Space Black",
      "گارانتی": "۲۴ ماه ضمانت طلایی",
      "اقلام همراه": "شارژر اصلی + جعبه"
    },
    description: "قدرتمندترین لپ‌تاپ ساخته شده توسط اپل برای حرفه‌ای‌ها. با تراشه M3 Max، هیچ پروژه‌ای غیرممکن نیست. این دستگاه مستقیماً از دبی وارد شده و دارای بالاترین سطح کیفی (Grade A++) است.",
    images: ["/hero/HeroImageJul.png", "/logo/main-logo.png", "/hero/HeroImageJul.png"]
  };

  return (
    <div className="bg-background min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 pt-32 pb-12 lg:pt-44 lg:pb-20 text-right" dir="rtl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-3 text-xs font-black text-muted-foreground mb-12 uppercase tracking-widest overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-primary transition-colors">خانه</Link>
          <span className="opacity-30">/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">فروشگاه</Link>
          <span className="opacity-30">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 mb-32">

          {/* Gallery Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-square sm:aspect-video lg:aspect-square rounded-[3.5rem] overflow-hidden bg-muted border border-border group shadow-sm transition-all duration-500 hover:shadow-xl">
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-contain p-12 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-8 right-8">
                <span className="bg-card/95 backdrop-blur-md px-5 py-2.5 rounded-full text-[10px] font-black border border-border uppercase tracking-widest shadow-lg text-foreground">
                  موجود در اشنویه 🇦🇪
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square rounded-[2rem] overflow-hidden border-2 transition-all duration-300 ${
                    activeImage === i ? 'border-primary ring-8 ring-primary/5' : 'border-border bg-muted hover:border-primary/40'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover p-3" />
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">آماده ارسال فوری از انبار</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-estedad mb-6 leading-[1.1] text-foreground tracking-tight">{product.name}</h1>
              <p className="text-muted-foreground leading-relaxed text-base lg:text-lg font-medium">
                {product.description}
              </p>
            </div>

            <div className="bg-card border border-border rounded-[3rem] p-10 space-y-8 shadow-sm">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">قیمت نهایی محصول</p>
                  <div className="text-4xl font-black text-foreground">
                    {product.price} <small className="text-sm font-normal mr-1 text-muted-foreground">تومان</small>
                  </div>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">Direct Import</div>
              </div>

              <div className="space-y-4">
                <Link href="/checkout" className="w-full h-18 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4">
                  <span className="text-2xl">🛒</span>
                  ادامه جهت تسویه حساب
                </Link>
                <Link href="https://wa.me/989143421641" target="_blank" className="w-full h-18 rounded-2xl border-2 border-border bg-background flex items-center justify-center gap-4 font-black text-sm text-foreground hover:bg-muted transition-all active:scale-95 shadow-sm">
                  <span>💬</span>
                  مشاوره تخصصی در واتس‌اپ
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 rounded-[2rem] border border-border bg-secondary flex items-center gap-4 group hover:border-primary/20 transition-all">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🛡️</span>
                  <span className="text-[11px] font-black leading-tight text-muted-foreground uppercase">ضمانت ۲۵ ساله آسو شنو</span>
               </div>
               <div className="p-5 rounded-[2rem] border border-border bg-secondary flex items-center gap-4 group hover:border-primary/20 transition-all">
                  <span className="text-2xl group-hover:scale-110 transition-transform">✈️</span>
                  <span className="text-[11px] font-black leading-tight text-muted-foreground uppercase">ارسال بیمه‌شده سراسری</span>
               </div>
            </div>
          </div>
        </div>

        {/* Specs Section (Bento Grid Style) */}
        <div className="space-y-16">
          <div className="flex items-center gap-6">
             <h2 className="text-3xl sm:text-4xl font-estedad text-foreground tracking-tight">بررسی فنی و مشخصات</h2>
             <div className="flex-1 h-px bg-border"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2 sm:px-0">
            {Object.entries(product.specs).map(([key, value], index) => (
              <div key={key} className={`bento-card p-10 flex flex-col justify-between min-h-[220px] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group ${index === 0 ? 'lg:col-span-2 lg:row-span-2 bg-slate-900 dark:bg-indigo-950 text-white border-none shadow-2xl relative overflow-hidden' : 'bg-card'}`}>
                {index === 0 && (
                   <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-20 translate-x-20"></div>
                )}
                <div className="space-y-2">
                   <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${index === 0 ? 'text-indigo-400' : 'text-muted-foreground'}`}>{key}</span>
                   <div className={`h-1 w-8 rounded-full transition-all duration-500 group-hover:w-16 ${index === 0 ? 'bg-indigo-500' : 'bg-primary/30'}`}></div>
                </div>
                <span className={`text-xl sm:text-2xl font-black mt-8 leading-tight tracking-tight ${index === 0 ? 'text-white' : 'text-foreground'}`}>{value}</span>
                {index === 0 && (
                   <div className="mt-8 flex items-center gap-3 text-[10px] font-bold text-indigo-300 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                      <span className="animate-pulse">⚡</span> High Performance Chip
                   </div>
                )}
              </div>
            ))}

            {/* Added a special Bento item for Warranty/Trust */}
            <div className="lg:col-span-2 bg-linear-to-br from-primary to-indigo-700 p-10 rounded-[3rem] text-white flex flex-col justify-center relative overflow-hidden shadow-2xl shadow-primary/20 group">
               <div className="absolute -left-10 -bottom-10 text-[12rem] opacity-10 font-black italic rotate-12 group-hover:rotate-0 transition-transform duration-1000">ASO</div>
               <div className="relative z-10 space-y-6">
                  <h4 className="text-3xl font-estedad">ضمانت‌نامه طلایی آسو شنو</h4>
                  <p className="text-sm font-medium opacity-80 leading-loose max-w-md">
                     تمامی لپ‌تاپ‌های ارائه شده در ویترین ما، پس از عبور از فیلترهای سخت‌گیرانه کارشناسان فنی در دبی و اشنویه، با برچسب اصالت و ضمانت‌نامه کتبی ۲۵ ساله عرضه می‌شوند.
                  </p>
                  <div className="flex gap-4 pt-4">
                     <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/10">🛡️</div>
                     <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/10">🤝</div>
                     <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/10">✨</div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-40">
          <div className="flex items-center justify-between mb-16 px-2 sm:px-0">
             <h2 className="text-3xl sm:text-4xl font-estedad text-foreground tracking-tight">محصولات مشابه</h2>
             <Link href="/shop" className="group flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest bg-card px-5 py-2.5 rounded-full border border-border shadow-sm">
                مشاهده همه
                <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
             </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 opacity-40 grayscale pointer-events-none">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="bento-card aspect-square bg-muted"></div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
