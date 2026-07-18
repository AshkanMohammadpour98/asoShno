'use client';

import React, { useState, useEffect } from 'react';
import SafeImage from '@/components/common/SafeImage';
import { getProducts } from '@/lib/actions/products';
import { LocalProduct } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { getPublicImageUrl } from '@/lib/upload-image';

interface ProductSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: LocalProduct) => void;
  categoryId?: string;
  excludeIds: string[];
  title?: string;
}

export default function ProductSelector({ isOpen, onClose, onSelect, categoryId, excludeIds, title }: ProductSelectorProps) {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
        const result = await getProducts({
          category: categoryId || undefined,
          search: searchTerm || undefined
        });
        if (result.success && result.data) {
          const filtered = (result.data as LocalProduct[]).filter(p => !excludeIds.includes(p.id));
          setProducts(filtered);
        } else {
          setProducts([]);
        }
    } catch (err) {
        console.error('Error loading products:', err);
        setProducts([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        loadProducts();
      }, 300); // Debounce search
      return () => clearTimeout(timer);
    }
  }, [isOpen, categoryId, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 fade-in duration-300" dir="rtl">

        {/* Header Section */}
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-estedad font-black text-slate-900 dark:text-white">{title || 'انتخاب محصول'}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">محصول مورد نظر را جستجو و انتخاب کنید.</p>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/30 transition-all active:scale-90 shadow-sm"
            >
              ✕
            </button>
          </div>

          <div className="relative group">
            <input
              type="text"
              placeholder="نام محصول، برند یا توضیحات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-14 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl opacity-40 group-focus-within:opacity-100 group-focus-within:text-primary transition-all">🔍</span>
            {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    ✕
                </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 no-scrollbar bg-white dark:bg-slate-900">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 animate-in fade-in duration-500">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">در حال جست‌وجوی هوشمند...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onSelect(product)}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-primary/40 hover:bg-white dark:hover:bg-slate-950 hover:shadow-xl hover:shadow-primary/5 transition-all text-right group"
                >
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                    <SafeImage
                      src={getPublicImageUrl(product.images[0] || '/logo/logo.png')}
                      alt={product.name}
                      fill
                      className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate mb-1 group-hover:text-primary transition-colors">{product.name}</p>
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400">{product.brands?.name || 'برند متفرقه'}</p>
                        <p className="text-xs text-primary font-black">
                        {formatPrice(product.price)} <small className="text-[10px] font-normal mr-1 text-slate-500">تومان</small>
                        </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center bg-slate-50/30 dark:bg-slate-950/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in duration-700">
              <span className="text-4xl mb-4 opacity-20 grayscale">📦</span>
              <p className="text-slate-400 dark:text-slate-500 font-bold italic text-sm">محصولی برای نمایش یافت نشد!</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
              >
                پاکسازی فیلترها
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-center items-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aso Shno Inventory Management System</p>
        </div>
      </div>
    </div>
  );
}
