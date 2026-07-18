'use client';

import React, { useState, useEffect } from 'react';
import { toggleWishlist, getWishlistStatus } from '@/lib/actions/wishlist';
import ShareModal from './ShareModal';
import { useRouter } from 'next/navigation';
import { LocalProduct } from '@/lib/types';

interface ProductDetailsActionsProps {
  product: LocalProduct;
}

export default function ProductDetailsActions({ product }: ProductDetailsActionsProps) {
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function checkWishlist() {
      const result = await getWishlistStatus(product.id);
      if (result.success) {
        setIsInWishlist(result.isInWishlist);
      }
    }
    checkWishlist();
  }, [product.id]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleWishlist = async () => {
    setLoadingWishlist(true);
    const result = await toggleWishlist(product.id);
    setLoadingWishlist(false);

    if (result.success) {
      setIsInWishlist(result.action === 'ADDED');
      setToast({
        message: result.action === 'ADDED' ? 'به لیست علاقه‌مندی‌ها اضافه شد' : 'از لیست علاقه‌مندی‌ها حذف شد',
        type: 'success'
      });
    } else if (result.error === 'NOT_AUTHENTICATED') {
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
    } else {
      setToast({ message: 'خطایی رخ داد', type: 'error' });
    }
  };

  const handleCompare = () => {
    router.push(`/compare?ids=${product.id}`);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="flex flex-wrap gap-2 lg:gap-3 items-center">
      <button
        onClick={handleWishlist}
        disabled={loadingWishlist}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 ${
          isInWishlist
          ? 'border-rose-500 bg-rose-50 text-rose-600'
          : 'border-border bg-background text-foreground hover:border-rose-500/30'
        }`}
      >
        <span className={`${loadingWishlist ? 'animate-pulse' : ''}`}>
          {isInWishlist ? '❤️' : '🤍'}
        </span>
        {isInWishlist ? 'علاقه‌مندی' : 'علاقه‌مندی'}
      </button>

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
