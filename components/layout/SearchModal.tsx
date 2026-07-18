import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/lib/actions/products';
import { getPublicImageUrl } from '@/lib/upload-image';
import { formatPrice } from '@/lib/utils';
import type { LocalProduct } from '@/lib/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'shop' | 'blog'>('shop');
  const [results, setResults] = useState<LocalProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggested = async () => {
    setIsLoading(true);
    const res = await getProducts(); // Get latest
    if (res.success) {
        setResults((res.data || []).slice(0, 3));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
      fetchSuggested();
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-start justify-center pt-10 sm:pt-20 px-4 transition-all duration-500 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-2xl bg-card rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-border transition-all duration-500 overflow-hidden ${
          isOpen ? 'translate-y-0 scale-100' : '-translate-y-10 scale-95'
        }`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) {
              router.push(`/${searchType}?search=${encodeURIComponent(query)}`);
              onClose();
            }
          }}
          className="p-4 sm:p-6 border-b border-border space-y-4 bg-secondary/30"
        >
          <div className="flex items-center gap-2 sm:gap-4 px-1 sm:px-2">
            <button
              type="button"
              onClick={() => setSearchType('shop')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${searchType === 'shop' ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground'}`}
            >
              محصولات
            </button>
            <button
              type="button"
              onClick={() => setSearchType('blog')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${searchType === 'blog' ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground'}`}
            >
              مجله خبری
            </button>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <span className="text-2xl sm:text-3xl opacity-40">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchType === 'shop' ? "جستجو در محصولات..." : "جستجو در مقالات..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg sm:text-xl font-estedad text-foreground placeholder:text-muted-foreground/50 py-2 sm:py-4 outline-none"
              dir="rtl"
            />
            <button
              type="button"
              onClick={onClose}
              className="h-10 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-muted text-foreground text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-border transition-all active:scale-95 whitespace-nowrap"
            >
              بستن
            </button>
          </div>
        </form>

        <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-8 no-scrollbar text-right" dir="rtl">
          <div className="space-y-8 sm:space-y-10">
            <div>
              <h4 className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 sm:mb-6 mr-1 sm:mr-2">دسترسی سریع</h4>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {['لپ‌تاپ استوک', 'تعمیر مادربرد', 'ارتقا SSD', 'قیمت روز'].map(tag => (
                  <button key={tag} className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-secondary border border-border text-[10px] sm:text-xs font-black text-foreground hover:border-primary hover:text-primary transition-all">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 sm:mb-6 mr-1 sm:mr-2">نتایج پیشنهادی</h4>
              <div className="space-y-3 sm:space-y-4">
                {isLoading ? (
                    <div className="py-10 text-center text-xs text-muted-foreground animate-pulse">در حال بارگذاری...</div>
                ) : results.map(item => (
                  <Link
                    key={item.id}
                    href={`/shop/product/${item.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 sm:gap-6 p-3 sm:p-4 rounded-2xl sm:rounded-[1.5rem] bg-secondary/50 border border-transparent hover:border-primary/20 hover:bg-card transition-all group"
                  >
                    <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl bg-muted border border-border overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                      <Image src={getPublicImageUrl(item.images[0] || '/logo/logo.png')} alt="" fill className="object-contain p-2 transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <h5 className="font-estedad text-base sm:text-xl text-foreground group-hover:text-primary transition-colors truncate">{item.name}</h5>
                      <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.categories?.name || 'محصول'}</span>
                    </div>
                    <div className="text-left flex-shrink-0">
                       <span className="font-black text-sm sm:text-lg text-foreground">{formatPrice(item.price)}</span>
                       <span className="text-[8px] sm:text-[10px] font-bold text-muted-foreground mr-1 uppercase">تومان</span>
                    </div>
                  </Link>
                ))}
                {!isLoading && results.length === 0 && (
                    <div className="py-10 text-center text-xs text-muted-foreground italic">محصولی برای نمایش یافت نشد.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-secondary border-t border-border flex justify-center">
           <Link
             href={`/${searchType}`}
             onClick={onClose}
             className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
           >
             مشاهده تمام نتایج {searchType === 'shop' ? 'در ویترین' : 'در مجله'}
           </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
