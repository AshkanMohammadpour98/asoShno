"use client";

import React, { useEffect, useState } from 'react';
import { useCart } from '@/components/providers/CartProvider';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPublicImageUrl } from '@/lib/upload-image';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const { items, totalAmount, totalCount } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  if (status === 'loading' || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 space-y-8" dir="rtl">
        <div className="text-8xl">🛒</div>
        <h1 className="text-3xl font-black text-foreground font-estedad">سبد خرید شما خالی است</h1>
        <p className="text-muted-foreground font-medium max-w-md">برای ادامه تسویه حساب، ابتدا باید محصولاتی را به سبد خرید خود اضافه کنید.</p>
        <Link href="/shop" className="h-16 px-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all">
          بریم به فروشگاه
        </Link>
      </div>
    );
  }

  const hasFreeShipping = items.some(i => i.shippingType === 'FREE');

  return (
    <div className="bg-secondary min-h-screen pt-32 pb-20 lg:pt-44" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* Main Content: Steps/Forms */}
          <div className="flex-1 w-full space-y-8">
            <div className="bg-card border border-border rounded-[3rem] p-8 lg:p-12 shadow-sm">
                <h1 className="text-3xl font-black text-foreground font-estedad mb-10 tracking-tight">خلاصه و تایید سفارش</h1>

                <div className="space-y-8">
                    {items.map((item) => (
                        <div key={`${item.id}-${item.colorName}`} className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[2.5rem] bg-secondary/30 border border-border/50 group">
                            <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-[2rem] bg-white border border-border overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                                <Image
                                  src={getPublicImageUrl(item.image)}
                                  alt={item.name}
                                  fill
                                  className="object-contain p-4 transition-transform group-hover:scale-110"
                                />
                            </div>
                            <div className="flex-1 text-center sm:text-right space-y-2">
                                <h4 className="font-estedad text-xl text-foreground font-bold leading-tight">{item.name}</h4>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                                    {item.colorName && (
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                            رنگ: {item.colorName}
                                        </span>
                                    )}
                                    <span className="bg-muted text-muted-foreground px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-border">
                                        تعداد: {item.qty} عدد
                                    </span>
                                </div>
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">قیمت واحد</p>
                                <span className="font-black text-xl text-foreground">{formatPrice(item.price)} <small className="text-[10px] font-normal mr-1">تومان</small></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Info (Read only for summary) */}
            <div className="bg-card border border-border rounded-[3rem] p-8 lg:p-12 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-foreground font-estedad">اطلاعات تحویل‌گیرنده</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary/30 p-8 rounded-[2rem] border border-border/50">
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">نام و نام خانوادگی</p>
                        <p className="font-black text-foreground">{(session?.user as any)?.firstName} {(session?.user as any)?.lastName}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">شماره تماس</p>
                        <p className="font-black text-foreground dir-ltr">{(session?.user as any)?.phone}</p>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-4 rounded-2xl">
                    ⚠️ توجه: در مرحله بعد آدرس دقیق پستی و روش ارسال را انتخاب خواهید کرد.
                </p>
            </div>
          </div>

          {/* Sidebar Summary */}
          <aside className="w-full lg:w-96 sticky top-32 space-y-8">
            <div className="bg-card border border-border rounded-[3.5rem] p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                <h3 className="text-2xl font-black text-foreground font-estedad mb-10">صورت‌حساب</h3>

                <div className="space-y-6">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-bold">تعداد کالاها</span>
                        <span className="font-black text-foreground">{totalCount} عدد</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-bold">جمع کل اقلام</span>
                        <span className="font-black text-foreground">{formatPrice(totalAmount)} تومان</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-bold">هزینه ارسال</span>
                        {hasFreeShipping ? (
                            <span className="text-emerald-600 font-black uppercase tracking-widest text-[10px]">رایگان (بیمه شده)</span>
                        ) : (
                            <span className="text-orange-500 font-black uppercase tracking-widest text-[10px]">طبق توافق (نامعلوم)</span>
                        )}
                    </div>

                    <div className="pt-8 border-t border-border flex flex-col gap-4">
                        <div className="flex justify-between items-end">
                            <span className="font-estedad text-2xl text-foreground">مبلغ نهایی</span>
                            <div className="text-left" dir="ltr">
                                <span className="font-black text-3xl text-primary block leading-none">{formatPrice(totalAmount)}</span>
                                <small className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 block">Toman</small>
                            </div>
                        </div>
                    </div>

                    <button className="w-full h-18 rounded-2xl bg-foreground text-background font-black text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-95 mt-4">
                        تایید و انتخاب روش پرداخت
                    </button>

                    <p className="text-[9px] text-center text-muted-foreground font-bold uppercase tracking-[0.2em] leading-relaxed">
                        Secure Checkout Powered by Aso Shno
                    </p>
                </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-center gap-4">
                <span className="text-3xl">🛡️</span>
                <p className="text-[11px] font-black text-muted-foreground leading-relaxed uppercase">
                    خرید شما شامل ضمانت‌نامه کتبی ۲۵ ساله آسو شنو و بیمه حوادث ارسال می‌باشد.
                </p>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
