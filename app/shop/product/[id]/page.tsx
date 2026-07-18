"use client";
import React, { useState, useEffect } from 'react';
import SafeImage from '@/components/common/SafeImage';
import Link from 'next/link';
import { getProductById } from '@/lib/actions/products';
import { notFound, useRouter } from 'next/navigation';
import { getPublicImageUrl } from '@/lib/upload-image';
import { useCart } from '@/components/providers/CartProvider';
import ProductDetailsActions from '@/components/shop/ProductDetailsActions';
import { formatPrice } from '@/lib/utils';
import type { LocalProduct, LocalProductVariant } from '@/lib/types';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<LocalProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<LocalProductVariant | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      const { id } = await params;
      const result = await getProductById(id);
      if (result.success && result.data) {
        setProduct(result.data as LocalProduct);
        if (result.data.variants && result.data.variants.length > 0) {
          setSelectedVariant(result.data.variants[0]);
        }
      } else {
        setProduct(null);
      }
      setLoading(false);
    }
    loadProduct();
  }, [params]);

  // Log product images for debugging
  useEffect(() => {
    if (product) {
      console.log(`[Details] Product loaded with Signed URLs: ${product.name}`);
      product.images.forEach((img, i) => {
        console.log(`[Details] Signed Image ${i}: ${img.substring(0, 100)}...`);
      });
    }
  }, [product]);

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

  // اگر محصول پیدا نشد یا خطایی رخ داد، به صفحه ۴۰۴ نرو، بلکه یک پیام نمایش بده
  // یا اگر واقعاً می‌خواهی ۴۰۴ باشد، مطمئن شو که ID درست است
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-right font-vazir" dir="rtl">
        <h2 className="text-2xl font-bold mb-4">محصول مورد نظر پیدا نشد</h2>
        <Link href="/shop" className="text-primary font-bold">بازگشت به فروشگاه</Link>
      </div>
    );
  }

  // Dynamic specs from database
  const specs = product.specs || [];

  const currentPrice = selectedVariant?.price ? Number(selectedVariant.price) : Number(product.price);
  const displayPrice = formatPrice(currentPrice);

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
                <SafeImage
                  src={product.images[activeImage]}
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
                  <SafeImage
                    src={img}
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
          <div className="lg:col-span-5 space-y-6 lg:space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 lg:mb-6">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${selectedVariant?.stock ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></span>
                  <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${selectedVariant?.stock ? 'text-emerald-600' : 'text-red-600'}`}>
                    {selectedVariant ? (selectedVariant.stock > 0 ? `آماده ارسال (${selectedVariant.stock} عدد)` : 'ناموجود') : 'بررسی موجودی...'}
                  </span>
                </div>
                {product.condition && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:block"></span>
                    <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
                      وضعیت: {product.condition}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-3xl lg:text-5xl font-estedad mb-4 lg:mb-6 leading-tight text-foreground tracking-tight">{product.name}</h1>
              <p className="text-muted-foreground leading-relaxed text-sm lg:text-base font-medium whitespace-pre-line line-clamp-3">
                {product.description || 'توضیحاتی برای این محصول وارد نشده است.'}
              </p>
            </div>

            {/* Quick Actions (Compact) */}
            <div className="border-t border-b border-border py-4">
              <ProductDetailsActions product={product} />
            </div>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <label className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">انتخاب رنگ</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {product.variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 lg:px-5 py-2 rounded-xl border-2 transition-all font-bold text-xs ${
                        selectedVariant?.colorName === v.colorName
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/20'
                      }`}
                    >
                      {v.colorName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-[2.5rem] p-6 lg:p-8 space-y-6 shadow-sm relative overflow-hidden">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 lg:mb-2">قیمت نهایی</p>
                  <div className="text-3xl lg:text-4xl font-black text-foreground">
                    {displayPrice} <small className="text-xs font-normal mr-1 text-muted-foreground">تومان</small>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 lg:gap-2">
                   {product.shippingType === 'FREE' ? (
                     <span className="text-[9px] lg:text-[10px] font-black text-emerald-600 uppercase tracking-widest">✈️ ارسال رایگان</span>
                   ) : (
                     <span className="text-[9px] lg:text-[10px] font-black text-orange-500 uppercase tracking-widest">✈️ طبق توافق</span>
                   )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    if (!selectedVariant || selectedVariant.stock <= 0) return;
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: currentPrice,
                      image: product.images[0] || '/logo/logo.png',
                      qty: 1,
                      colorName: selectedVariant.colorName,
                      shippingType: product.shippingType
                    });
                    setIsAdded(true);
                    setTimeout(() => setIsAdded(false), 2000);
                  }}
                  disabled={!selectedVariant || selectedVariant.stock <= 0}
                  className={`h-16 lg:h-18 rounded-2xl font-black text-base lg:text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
                    isAdded
                    ? 'bg-emerald-500 text-white'
                    : (!selectedVariant || selectedVariant.stock <= 0)
                      ? 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
                      : 'bg-primary text-primary-foreground shadow-primary/30 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  <span className="text-xl lg:text-2xl">{isAdded ? '✅' : '🛒'}</span>
                  {isAdded ? 'به سبد اضافه شد' : 'افزودن به سبد خرید'}
                </button>
                <Link href="https://wa.me/989143421641" target="_blank" className="h-16 lg:h-18 rounded-2xl border-2 border-border bg-background flex items-center justify-center gap-3 font-black text-xs lg:text-sm text-foreground hover:bg-muted transition-all active:scale-95">
                  <span>💬</span>
                  مشاوره تخصصی
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
               <div className="p-4 lg:p-5 rounded-2xl lg:rounded-[2rem] border border-border bg-secondary/50 flex items-center gap-3 group hover:border-primary/20 transition-all">
                  <span className="text-xl group-hover:scale-110 transition-transform">🛡️</span>
                  <span className="text-[10px] font-black leading-tight text-muted-foreground uppercase">ضمانت ۲۵ ساله</span>
               </div>
               <div className="p-4 lg:p-5 rounded-2xl lg:rounded-[2rem] border border-border bg-secondary/50 flex items-center gap-3 group hover:border-primary/20 transition-all">
                  <span className="text-xl group-hover:scale-110 transition-transform">✈️</span>
                  <span className="text-[10px] font-black leading-tight text-muted-foreground uppercase">ارسال بیمه‌شده</span>
               </div>
            </div>
          </div>
        </div>

        {/* Dynamic Specs Section */}
        <div className="space-y-10 lg:space-y-12">
          <div className="flex items-center gap-4">
             <h2 className="text-2xl sm:text-3xl font-estedad text-foreground tracking-tight">مشخصات فنی</h2>
             <div className="flex-1 h-px bg-border"></div>
          </div>

          {specs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-1 sm:px-0">
              {specs.map((spec: any, index: number) => (
                <div key={index} className="bento-card p-5 sm:p-6 flex items-center justify-between min-h-[80px] sm:min-h-[100px] transition-all duration-300 hover:border-primary/20 bg-card group">
                  <div className="space-y-1 text-right">
                     <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block group-hover:text-primary transition-colors">{spec.key}</span>
                     <span className="text-sm sm:text-base font-black text-foreground">
                        {spec.value || 'وارد نشده'}
                     </span>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all">
                     <span className="text-xs">⚡</span>
                  </div>
                </div>
              ))}

              {/* Trust Card (Compact) */}
              <div className="sm:col-span-2 bg-linear-to-br from-primary to-indigo-700 p-6 sm:p-8 rounded-[2rem] text-white flex flex-col justify-center relative overflow-hidden shadow-xl shadow-primary/20 group">
                 <div className="absolute -left-6 -bottom-6 text-7xl opacity-10 font-black italic rotate-12 group-hover:rotate-0 transition-transform duration-1000">ASO</div>
                 <div className="relative z-10 space-y-3">
                    <h4 className="text-xl sm:text-2xl font-estedad">ضمانت‌نامه طلایی</h4>
                    <p className="text-[11px] sm:text-xs font-medium opacity-80 leading-relaxed max-w-sm">
                       تمامی لپ‌تاپ‌های آسو شنو پس از تست‌های سخت‌گیرانه در دبی و اشنویه، با ضمانت‌نامه ۲۵ ساله عرضه می‌شوند.
                    </p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-card rounded-[2rem] border border-dashed border-border text-muted-foreground font-black text-xs uppercase tracking-widest">
               مشخصاتی ثبت نشده است.
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && product.images?.[activeImage] && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-10 animate-fade-in" onClick={() => setIsLightboxOpen(false)}>
          <button className="absolute top-8 right-8 text-4xl text-foreground z-[110]" onClick={() => setIsLightboxOpen(false)}>✕</button>
          <div className="relative w-full h-full max-w-6xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <SafeImage
              src={product.images[activeImage]}
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
