'use client';

import React, { useState, useEffect } from 'react';
import ShareModal from './ShareModal';
import WishlistButton from './WishlistButton';
import { useRouter } from 'next/navigation';
import { LocalProduct } from '@/lib/types';

interface ProductDetailsActionsProps {
  product: LocalProduct;
}

export default function ProductDetailsActions({ product }: ProductDetailsActionsProps) {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const handleWishlistUpdate = () => {
      // Logic to show a toast or something if needed
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleCompare = () => {
    router.push(`/compare?ids=${product.id}`);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="flex flex-wrap gap-2 lg:gap-3 items-center">
      <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-2xl">
        <WishlistButton
          productId={product.id}
          className="w-10 h-10 p-2 text-muted-foreground hover:text-red-500"
        />
        <span className="text-[10px] font-black text-foreground uppercase tracking-widest border-r border-border pr-3">
          علاقه‌مندی
        </span>
      </div>

      <button
        onClick={handleCompare}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground transition-all font-black text-[10px] uppercase tracking-widest hover:border-primary/30 active:scale-95"
      >
        <span>📊</span>
        مقایسه
      </button>

      <button
        onClick={() => setIsShareModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground transition-all font-black text-[10px] uppercase tracking-widest hover:border-primary/30 active:scale-95"
      >
        <span>🔗</span>
        اشتراک
      </button>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        productName={product.name}
        url={currentUrl}
      />

      {/* Simple Toast implementation */}
      {toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm animate-in slide-in-from-bottom duration-300 ${
          toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
