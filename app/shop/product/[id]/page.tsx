"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById } from '@/lib/actions/products';
import { notFound } from 'next/navigation';
import { getPublicImageUrl } from '@/lib/upload-image';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      const { id } = await params;
      const result = await getProductById(id);
      if (result.success && result.data) {
        setProduct(result.data);
      } else {
        setProduct(null);
      }
      setLoading(false);
    }
    loadProduct();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-right font-vazir" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">در حال بارگذاری محصول...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  // Dynamic specs from database
  const specs = product.specs || [];

  const displayPrice = Number(product.price).toLocaleString('fa-IR');

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
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative aspect-square sm:aspect-video lg:aspect-square rounded-[3.5rem] overflow-hidden bg-muted border border-border group shadow-sm transition-all duration-500 hover:shadow-xl cursor-zoom-in"
            >
              {product.images?.[activeImage] ? (
                <Image
                  src={getPublicImageUrl(product.images[activeImage])}
                  alt={product.name}
                  fill
                  className="object-contain p-12 transition-all duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 600px"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300 text-6xl">🖼️</div>
              )}
              <div className="absolute top-8 right-8">
                <span className="bg-card/95 backdrop-blur-md px-5 py-2.5 rounded-full text-[10px] font-black border border-border uppercase tracking-widest shadow-lg text-foreground">
                  موجود در اشنویه 🇦🇪
                </span>
              </div>
              <div className="absolute bottom-8 left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <div className="bg-primary/90 text-white p-3 rounded-2xl backdrop-blur-sm shadow-xl">
                    <span className="text-xl">🔍</span>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {product.images?.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square rounded-[2rem] overflow-hidden border-2 transition-all duration-300 ${
                    activeImage === i ? 'border-primary ring-8 ring-primary/5' : 'border-border bg-muted hover:border-primary/40'
                  }`}
                >
                  <Image
                    src={getPublicImageUrl(img)}
                    alt=""
                    fill
                    className="object-cover p-3"
                    sizes="150px"
                  />
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
                {product.condition && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                    <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
                      وضعیت: {product.condition}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-4xl lg:text-6xl font-estedad mb-6 leading-[1.1] text-foreground tracking-tight">{product.name}</h1>
              <p className="text-muted-foreground leading-relaxed text-base lg:text-lg font-medium whitespace-pre-line">
                {product.description || 'توضیحاتی برای این محصول وارد نشده است.'}
              </p>
            </div>

            <div className="bg-card border border-border rounded-[3rem] p-10 space-y-8 shadow-sm">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">قیمت نهایی محصول</p>
                  <div className="text-4xl font-black text-foreground">
                    {displayPrice} <small className="text-sm font-normal mr-1 text-muted-foreground">تومان</small>
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

        {/* Dynamic Specs Section */}
        <div className="space-y-16">
          <div className="flex items-center gap-6">
             <h2 className="text-3xl sm:text-4xl font-estedad text-foreground tracking-tight">بررسی فنی و مشخصات</h2>
             <div className="flex-1 h-px bg-border"></div>
          </div>

          {specs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2 sm:px-0">
              {specs.map((spec: any, index: number) => (
                <div key={index} className={`bento-card p-10 flex flex-col justify-between min-h-[220px] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group ${index === 0 ? 'lg:col-span-2 lg:row-span-2 bg-slate-900 dark:bg-indigo-950 text-white border-none shadow-2xl relative overflow-hidden' : 'bg-card'}`}>
                  {index === 0 && (
                     <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-20 translate-x-20"></div>
                  )}
                  <div className="space-y-2">
                     <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${index === 0 ? 'text-indigo-400' : 'text-muted-foreground'}`}>{spec.key}</span>
                     <div className={`h-1 w-8 rounded-full transition-all duration-500 group-hover:w-16 ${index === 0 ? 'bg-indigo-500' : 'bg-primary/30'}`}></div>
                  </div>
                  <span className={`text-xl sm:text-2xl font-black mt-8 leading-tight tracking-tight ${index === 0 ? 'text-white' : 'text-foreground'}`}>
                      {spec.value || 'وارد نشده'}
                  </span>
                </div>
              ))}

              {/* Trust Bento Card */}
              <div className="lg:col-span-2 bg-linear-to-br from-primary to-indigo-700 p-10 rounded-[3rem] text-white flex flex-col justify-center relative overflow-hidden shadow-2xl shadow-primary/20 group">
                 <div className="absolute -left-10 -bottom-10 text-[12rem] opacity-10 font-black italic rotate-12 group-hover:rotate-0 transition-transform duration-1000">ASO</div>
                 <div className="relative z-10 space-y-6">
                    <h4 className="text-3xl font-estedad">ضمانت‌نامه طلایی آسو شنو</h4>
                    <p className="text-sm font-medium opacity-80 leading-loose max-w-md">
                       تمامی لپ‌تاپ‌های ارائه شده در ویترین ما، پس از عبور از فیلترهای سخت‌گیرانه کارشناسان فنی در دبی و اشنویه، با برچسب اصالت و ضمانت‌نامه کتبی ۲۵ ساله عرضه می‌شوند.
                    </p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center bg-card rounded-[3rem] border border-dashed border-border text-muted-foreground font-black uppercase tracking-widest">
               مشخصات فنی برای این محصول ثبت نشده است.
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && product.images?.[activeImage] && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-10 animate-fade-in" onClick={() => setIsLightboxOpen(false)}>
          <button className="absolute top-8 right-8 text-4xl text-foreground z-[110]" onClick={() => setIsLightboxOpen(false)}>✕</button>
          <div className="relative w-full h-full max-w-6xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={getPublicImageUrl(product.images[activeImage])}
              alt=""
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
