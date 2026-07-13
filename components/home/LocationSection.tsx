"use client";
import React from 'react';
import Link from 'next/link';
import NeshanMap from '@/components/common/NeshanMap';

const LocationSection = () => {
  const mapAddress = "استان آذربایجان غربی، اشنویه، امام، سربازان گمنام";

  return (
    <section className="py-24 bg-card relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text Content */}
          <div className="space-y-8 text-right order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              میزبانی حضوری شما افتخار ماست
            </div>

            <h2 className="text-4xl lg:text-6xl font-estedad text-foreground leading-tight tracking-tight">
              باکس نقشه و <br />
              <span className="gradient-text">موقعیت جغرافیایی</span>
            </h2>

            <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-xl">
              شرکت آسو شنو در مرکز شهرستان اشنویه، آماده ارائه خدمات حضوری، مشاوره خرید و تعمیرات تخصصی به شما عزیزان است.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-xl shrink-0">📍</div>
                <div>
                  <h4 className="font-black text-foreground text-sm mb-1 uppercase tracking-wider">آدرس دقیق</h4>
                  <p className="text-muted-foreground text-sm font-bold">{mapAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-xl shrink-0">⏰</div>
                <div>
                  <h4 className="font-black text-foreground text-sm mb-1 uppercase tracking-wider">ساعات کاری</h4>
                  <p className="text-muted-foreground text-sm font-bold">شنبه تا پنجشنبه: ۹:۰۰ الی ۲۱:۰۰</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/contact" className="h-14 px-8 rounded-2xl bg-foreground text-background font-black text-sm flex items-center justify-center hover:scale-105 transition-all active:scale-95 shadow-xl shadow-black/5">
                جزئیات بیشتر تماس
              </Link>
              <Link href="https://nshn.ir/_bW7KuYANZqo" target="_blank" className="h-14 px-8 rounded-2xl border-2 border-border font-black text-foreground text-sm flex items-center justify-center hover:bg-muted transition-all">
                مسیریابی هوشمند
              </Link>
            </div>
          </div>

          {/* Map Box */}
          <div className="order-1 lg:order-2">
            <div className="relative aspect-square lg:aspect-[4/3] rounded-[3rem] overflow-hidden border-8 border-secondary shadow-2xl group">
              <NeshanMap
                latitude={37.040637}
                longitude={45.094340}
                address={mapAddress}
              />
              <div className="absolute inset-0 pointer-events-none border-[1px] border-white/10 rounded-[2.5rem] z-20"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LocationSection;
