"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled Error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full text-center space-y-8 p-10 bg-card border border-border rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>

        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-5xl mx-auto border-4 border-red-500/20">
          ⚠️
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-foreground font-estedad">متأسفیم، خطایی رخ داد</h1>
          <p className="text-muted-foreground font-medium leading-relaxed">
            سیستم در پردازش درخواست شما با مشکل مواجه شد. این موضوع می‌تواند موقتی باشد.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => reset()}
            className="h-14 w-full bg-primary text-primary-foreground rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
          >
            تلاش مجدد
          </button>

          <Link
            href="/"
            className="h-14 w-full bg-secondary text-foreground rounded-2xl font-black text-sm flex items-center justify-center border border-border hover:bg-muted transition-all"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>

        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">
          Error Digest: {error.digest || 'Internal Server Error'}
        </p>
      </div>
    </div>
  );
}
