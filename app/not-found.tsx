"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-2xl w-full text-center space-y-10">

        <div className="relative h-64 w-full flex items-center justify-center">
            <span className="text-[12rem] font-black text-muted/20 absolute select-none">404</span>
            <div className="z-10 bg-background p-6 rounded-[2rem] border-2 border-primary/20 shadow-2xl animate-bounce">
                <span className="text-6xl">🔍</span>
            </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl lg:text-6xl font-estedad font-black text-foreground">صفحه پیدا نشد!</h1>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-lg mx-auto">
            متأسفانه آدرسی که به دنبال آن هستید وجود ندارد یا به آدرس دیگری منتقل شده است.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="h-16 px-10 bg-primary text-primary-foreground rounded-2xl font-black text-sm flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            بریم صفحه اصلی
          </Link>

          <Link
            href="/shop"
            className="h-16 px-10 bg-secondary text-foreground rounded-2xl font-black text-sm flex items-center justify-center border-2 border-border hover:bg-muted transition-all"
          >
            مشاهده فروشگاه
          </Link>
        </div>

        <div className="pt-10 flex items-center justify-center gap-8 opacity-40">
            <span className="h-px flex-1 bg-linear-to-r from-transparent to-muted-foreground"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Premium Tech Hub</span>
            <span className="h-px flex-1 bg-linear-to-l from-transparent to-muted-foreground"></span>
        </div>
      </div>
    </div>
  );
}
