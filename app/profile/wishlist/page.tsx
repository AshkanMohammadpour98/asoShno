"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { useCart } from '@/components/providers/CartProvider';
import { getProductsByIds } from '@/lib/actions/products';
import { formatPrice } from '@/lib/utils';
import SafeImage from '@/components/common/SafeImage';
import WishlistButton from '@/components/shop/WishlistButton';
import ProductSkeleton from '@/components/shop/ProductSkeleton';
import type { LocalProduct } from '@/lib/types';
import { FiShoppingBag, FiArrowRight, FiHeart } from 'react-icons/fi';

export default function WishlistPage() {
  const { wishlist, count, loading: wishlistLoading } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await getProductsByIds(wishlist);
        if (res.success) {
          setProducts(res.data || []);
        }
      } catch (error) {
        console.error('Failed to load wishlist products:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!wishlistLoading) {
      loadProducts();
    }
  }, [wishlist, wishlistLoading]);

  if (wishlistLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 lg:pt-36 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-24 pb-20 lg:pt-36 transition-colors duration-300" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 lg:mb-16">
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest mb-4 border border-red-500/10">
              علاقه‌مندی‌های شما
            </div>
            <h1 className="text-4xl lg:text-7xl font-estedad text-foreground tracking-tight">لیست <span className="text-red-500">پسندیده‌ها</span></h1>
            <p className="text-muted-foreground mt-4 text-base lg:text-lg font-medium">
              {count > 0 ? `${count} محصول در لیست انتظار خرید شماست.` : 'هنوز هیچ محصولی را به لیست خود اضافه نکرده‌اید.'}
            </p>
          </div>
          <Link href="/shop" className="group flex items-center gap-2 text-xs font-black text-muted-foreground hover:text-primary transition-colors">
            <span>بازگشت به فروشگاه</span>
            <FiArrowRight className="rotate-180 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-card border border-border rounded-[2.5rem] lg:rounded-[3rem] p-10 lg:p-20 text-center flex flex-col items-center">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-red-500/5 flex items-center justify-center text-5xl lg:text-6xl mb-8 border border-red-500/10 relative">
               <FiHeart className="text-red-500/20" />
               <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                  <FiHeart className="text-red-500/40" />
               </div>
            </div>
            <h3 className="text-2xl lg:text-3xl font-black text-foreground mb-4">لیست شما خالی است</h3>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto text-sm lg:text-base leading-relaxed">
              با کلیک روی آیکون قلب در صفحات محصولات، می‌توانید موارد مورد علاقه خود را اینجا ذخیره کنید.
            </p>
            <Link href="/shop" className="h-16 px-12 bg-primary text-primary-foreground rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95">
              <span>مشاهده محصولات</span>
              <FiShoppingBag className="text-xl" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-card border border-border rounded-[2rem] p-4 flex flex-col group hover:shadow-xl hover:shadow-black/5 transition-all duration-500 relative">

                {/* Remove Button (Wishlist Toggle) */}
                <div className="absolute top-6 left-6 z-20">
                  <WishlistButton
                    productId={product.id}
                    className="w-10 h-10 bg-background/80 backdrop-blur-md rounded-xl border border-border shadow-sm text-red-500"
                  />
                </div>

                {/* Product Image */}
                <Link href={`/shop/product/${product.id}`} className="aspect-square rounded-2xl bg-muted/50 mb-4 flex items-center justify-center overflow-hidden border border-transparent group-hover:border-primary/10 transition-all duration-500">
                  <SafeImage
                    src={product.images?.[0] || '/logo/logo.png'}
                    alt={product.name}
                    fill
                    className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 250px"
                  />
                </Link>

                {/* Product Info */}
                <div className="px-2 flex-1 flex flex-col">
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">{product.categories?.name}</span>
                  <Link href={`/shop/product/${product.id}`}>
                    <h3 className="text-base font-bold text-foreground hover:text-primary transition-colors truncate mb-3">{product.name}</h3>
                  </Link>

                  <div className="mt-auto pt-4 border-t border-border flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">قیمت</span>
                      <span className="font-black text-lg text-foreground tracking-tight">
                        {formatPrice(product.price)} <small className="text-[9px] font-normal mr-0.5 opacity-60">تومان</small>
                      </span>
                    </div>

                    <button
                      onClick={() => addItem(product)}
                      className="w-full h-12 bg-foreground text-background dark:bg-primary dark:text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                    >
                      <span>افزودن به سبد</span>
                      <FiShoppingBag className="text-base" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
