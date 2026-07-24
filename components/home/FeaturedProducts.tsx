import React from 'react';
import SafeImage from '@/components/common/SafeImage';
import WishlistButton from '@/components/shop/WishlistButton';
import Link from 'next/link';
import { getPublicImageUrl } from '@/lib/upload-image';
import { formatPrice } from '@/lib/utils';
import type { LocalProduct } from '@/lib/types';

interface FeaturedProductsProps {
  products: LocalProduct[];
}

const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
  return (
    <section className="py-12 sm:py-20 relative overflow-hidden bg-secondary/50 transition-colors duration-300">
      <div className="container mx-auto px-4 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-10 sm:mb-16 gap-4 sm:gap-6">
          <div className="max-w-2xl text-center md:text-right">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-foreground">محصولات منتخب</h2>
            <p className="text-muted-foreground text-sm sm:text-lg leading-relaxed font-medium">
              دستچین شده از بهترین لپ‌تاپ‌های وارداتی دبی، با ضمانت‌نامه ۲۵ ساله آسو شنو.
            </p>
          </div>
          <Link href="/shop" className="group flex items-center gap-2 text-[10px] sm:text-xs font-black text-primary uppercase tracking-widest bg-card px-4 py-2 rounded-full border border-border shadow-sm">
            مشاهده کل ویترین
            <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 px-2 sm:px-0">
          {products.length > 0 ? (
            products.map((product) => (
              <Link
                key={product.id}
                href={`/shop/product/${product.id}`}
                className="bento-card group p-4 border-border bg-card flex flex-col hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                {/* ... existing card content ... */}
                <div className="aspect-square overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-muted/50 relative border border-transparent group-hover:border-primary/20 transition-all duration-700">
                  <WishlistButton
                    productId={product.id}
                    className="absolute top-4 left-4 z-20 w-8 h-8 sm:w-10 sm:h-10"
                  />
                  <SafeImage
                    src={getPublicImageUrl(product.images?.[0] || '/logo/logo.png')}
                    alt={product.name}
                    fill
                    className="object-contain p-6 sm:p-8 transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col gap-1.5 sm:gap-2">
                    <span className="bg-card/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black border border-border uppercase tracking-widest shadow-sm text-foreground">
                      {product.categories?.name || 'محصول'}
                    </span>
                    {product.isFeatured && (
                      <span className="bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                        ویژه
                      </span>
                    )}
                  </div>

                  {/* Hover Specs Overlay */}
                  <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center text-white scale-95 group-hover:scale-100">
                    <p className="text-[7px] font-black uppercase tracking-[0.2em] mb-3 opacity-70">Specs Overview</p>
                    <div className="space-y-2 w-full max-w-[120px]">
                        {product.specs?.slice(0, 3).map((spec, i: number) => (
                          <div key={i} className="text-[9px] font-bold border-b border-white/20 pb-1 last:border-0 truncate">{spec.key}: {spec.value}</div>
                        )) || <div className="text-[9px] font-bold">مشخصاتی ثبت نشده است</div>}
                    </div>
                    <span className="mt-6 h-8 px-4 rounded-lg bg-white text-primary font-black text-[8px] uppercase tracking-widest flex items-center justify-center">مشاهده محصول</span>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 px-1 sm:px-2 flex-1 flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">{product.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {product.specs?.slice(0, 2).map((spec, i: number) => (
                        <span key={i} className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase">
                          {spec.value} {i < 1 && '•'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3 sm:pt-4 border-t border-border">
                    <div className="flex flex-col">
                      <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">قیمت نهایی</span>
                      <span className="text-base sm:text-xl font-extrabold text-foreground leading-none">
                          {formatPrice(product.price)} <small className="text-[9px] font-normal mr-0.5 text-muted-foreground">تومان</small>
                      </span>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-[1rem] sm:rounded-[1.2rem] bg-primary text-primary-foreground flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 active:scale-90 shadow-lg shadow-primary/20 relative overflow-hidden">
                      <span className="text-lg sm:text-xl z-10">🛒</span>
                      <div className="absolute inset-0 bg-white/20 translate-y-10 group-hover:translate-y-0 transition-transform duration-500"></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-card rounded-[2.5rem] border-2 border-dashed border-border/60 animate-in fade-in duration-700">
              <span className="text-5xl mb-6 opacity-30 grayscale">📦</span>
              <p className="text-muted-foreground font-bold text-lg mb-2">در حال حاضر دریافت اطلاعات محصولات با مشکل مواجه شده است.</p>
              <p className="text-muted-foreground/60 text-sm">لطفاً چند لحظه بعد دوباره تلاش کنید یا وضعیت اتصال خود را بررسی کنید.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
