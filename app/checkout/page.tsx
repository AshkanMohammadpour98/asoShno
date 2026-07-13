"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="bg-background min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 lg:py-24 max-w-7xl text-right" dir="rtl">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* Main Checkout Form */}
          <div className="flex-1 space-y-12">
            <div className="flex items-center gap-10 mb-16 overflow-x-auto pb-4 no-scrollbar">
               {[
                 { id: 1, label: 'اطلاعات ارسال' },
                 { id: 2, label: 'شیوه پرداخت' },
                 { id: 3, label: 'تایید نهایی' }
               ].map((s) => (
                 <div key={s.id} className="flex items-center gap-4 whitespace-nowrap">
                   <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                     step >= s.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'
                   }`}>
                     {s.id}
                   </div>
                   <span className={`text-xs font-black tracking-widest uppercase ${
                     step >= s.id ? 'text-foreground' : 'text-muted-foreground/50'
                   }`}>
                     {s.label}
                   </span>
                   {s.id < 3 && <div className="hidden sm:block w-16 h-px bg-border mr-4"></div>}
                 </div>
               ))}
            </div>

            <div className="bg-card border border-border rounded-[3.5rem] p-8 lg:p-16 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/10"></div>

              {step === 1 && (
                <div className="animate-fade-in space-y-10">
                  <h2 className="text-3xl font-estedad text-foreground tracking-tight">اطلاعات تحویل‌گیرنده</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 mr-4">نام و نام خانوادگی</label>
                      <input type="text" className="w-full h-16 bg-secondary border border-transparent focus:border-primary focus:bg-card rounded-2xl px-8 text-sm font-black text-foreground transition-all outline-none" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 mr-4">شماره تماس</label>
                      <input type="tel" className="w-full h-16 bg-secondary border border-transparent focus:border-primary focus:bg-card rounded-2xl px-8 text-sm font-black text-foreground transition-all outline-none dir-ltr text-right" />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 mr-4">آدرس دقیق پستی</label>
                      <textarea rows={4} className="w-full bg-secondary border border-transparent focus:border-primary focus:bg-card rounded-[2rem] px-8 py-6 text-sm font-black text-foreground transition-all outline-none resize-none"></textarea>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 mr-4">استان</label>
                      <select className="w-full h-16 bg-secondary border border-transparent focus:border-primary focus:bg-card rounded-2xl px-8 text-sm font-black text-foreground transition-all appearance-none cursor-pointer">
                        <option>آذربایجان غربی</option>
                        <option>تهران</option>
                        <option>کردستان</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 mr-4">کد پستی</label>
                      <input type="text" className="w-full h-16 bg-secondary border border-transparent focus:border-primary focus:bg-card rounded-2xl px-8 text-sm font-black text-foreground transition-all dir-ltr text-right" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in space-y-10">
                  <h2 className="text-3xl font-estedad text-foreground tracking-tight">انتخاب شیوه پرداخت</h2>
                  <div className="grid grid-cols-1 gap-6">
                    <button className="flex items-center justify-between p-8 rounded-[2.5rem] border-2 border-primary bg-primary/5 group text-right">
                      <div className="flex items-center gap-8">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-card border border-border flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">💳</div>
                        <div>
                          <h4 className="font-black text-xl text-foreground">پرداخت آنلاین هوشمند</h4>
                          <p className="text-sm text-muted-foreground mt-2 font-medium">کلیه کارت‌های عضو شتاب (امن، سریع و با تایید آنی)</p>
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full border-[6px] border-primary bg-card"></div>
                    </button>
                    <button className="flex items-center justify-between p-8 rounded-[2.5rem] border-2 border-border bg-muted/30 hover:border-primary/30 transition-all group text-right opacity-70">
                      <div className="flex items-center gap-8">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-card border border-border flex items-center justify-center text-3xl">🏦</div>
                        <div>
                          <h4 className="font-black text-xl text-foreground">کارت به کارت / واریز بانکی</h4>
                          <p className="text-sm text-muted-foreground mt-2 font-medium">ارسال فیش واریزی در تلگرام یا واتس‌اپ آسو شنو</p>
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full border-2 border-border"></div>
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-16 pt-12 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-8">
                <button
                  onClick={() => setStep(prev => prev - 1)}
                  disabled={step === 1}
                  className={`text-sm font-black uppercase tracking-widest transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  ← مرحله قبلی
                </button>
                <button
                  onClick={() => setStep(prev => Math.min(prev + 1, 3))}
                  className="h-18 px-16 rounded-[1.5rem] bg-foreground text-background font-black text-lg shadow-2xl shadow-black/10 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                >
                  {step === 3 ? 'تایید و پرداخت نهایی' : 'ادامه فرآیند خرید'}
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="w-full lg:w-[400px]">
            <div className="bg-card border border-border rounded-[3rem] p-10 sticky top-24 shadow-sm transition-colors duration-300">
              <h3 className="text-2xl font-estedad mb-10 text-foreground tracking-tight">خلاصه سفارش</h3>
              <div className="space-y-8 mb-10">
                 <div className="flex gap-6 items-center">
                    <div className="h-20 w-20 rounded-[1.5rem] bg-muted border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <Image src="/hero/HeroImageJul.png" alt="" width={60} height={60} className="object-contain p-2" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-sm text-foreground">MacBook Pro M3 Max</h4>
                      <div className="flex items-center justify-between mt-2">
                         <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">تعداد: ۱ عدد</p>
                         <span className="font-black text-sm text-foreground">۱۸۵,۰۰۰,۰۰۰</span>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-5 pt-8 border-t border-border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-bold">مجموع سبد خرید:</span>
                  <span className="font-black text-foreground">۱۸۵,۰۰۰,۰۰۰</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-bold">هزینه ارسال:</span>
                  <span className="text-emerald-500 font-black tracking-[0.2em] uppercase text-[10px]">رایگان (بیمه شده)</span>
                </div>
                <div className="pt-6 border-t border-border flex justify-between items-end">
                  <span className="font-estedad text-2xl text-foreground">قابل پرداخت</span>
                  <div className="text-right">
                    <span className="font-black text-3xl text-primary block leading-none">۱۸۵,۰۰۰,۰۰۰</span>
                    <small className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 block">تومان</small>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                 <div className="flex gap-4">
                    <span className="text-2xl">🛡️</span>
                    <p className="text-[11px] font-black text-primary leading-relaxed uppercase">
                      تمام تراکنش‌ها در شبکه آسو شنو امن و دارای گواهی SSL می‌باشند. خرید شما با ضمانت ۲۵ ساله ما همراه است.
                    </p>
                 </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
