'use client';

import React, { useState, useEffect } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  url: string;
}

export default function ShareModal({ isOpen, onClose, productName, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          ✕
        </button>

        <div className="text-center space-y-4 mb-8">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            🔗
          </div>
          <h3 className="text-2xl font-estedad font-bold">اشتراک‌گذاری</h3>
          <p className="text-muted-foreground text-sm font-medium">
            این کالا را با دوستان خود به اشتراک بگذارید!
          </p>
          <p className="text-foreground font-bold text-sm line-clamp-1">{productName}</p>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <input
              type="text"
              readOnly
              value={url}
              className="w-full h-14 bg-muted/50 border border-border rounded-2xl px-6 pl-20 text-xs font-mono text-left dir-ltr focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleCopy}
              className={`absolute left-2 top-2 bottom-2 px-4 rounded-xl font-black text-[10px] uppercase transition-all ${
                copied ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground hover:scale-105'
              }`}
            >
              {copied ? 'کپی شد!' : 'کپی لینک'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(productName + '\n' + url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-14 rounded-2xl border border-border bg-background flex items-center justify-center gap-3 hover:bg-emerald-50 transition-colors group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">💬</span>
              <span className="text-xs font-black">واتس‌اپ</span>
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(productName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-14 rounded-2xl border border-border bg-background flex items-center justify-center gap-3 hover:bg-sky-50 transition-colors group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">✈️</span>
              <span className="text-xs font-black">تلگرام</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
