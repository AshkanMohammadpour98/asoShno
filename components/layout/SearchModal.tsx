import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'shop' | 'blog'>('shop');

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const results = [
    { id: 1, name: "MacBook Pro M3 Max", category: "لپ‌تاپ", price: "۱۸۵,۰۰۰,۰۰۰", image: "/hero/HeroImageJul.png" },
    { id: 2, name: "Asus ROG Strix", category: "گیمینگ", price: "۹۴,۰۰۰,۰۰۰", image: "/hero/HeroImageJul.png" },
    { id: 3, name: "باتری اصلی مک‌بوک", category: "قطعات", price: "۴,۵۰۰,۰۰۰", image: "/logo/logo.png" },
  ];

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 transition-all duration-500 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-2xl bg-card rounded-[3rem] shadow-2xl border border-border transition-all duration-500 overflow-hidden ${
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
          className="p-6 border-b border-border space-y-4 bg-secondary/30"
        >
          <div className="flex items-center gap-4 px-2">
            <button
              type="button"
              onClick={() => setSearchType('shop')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${searchType === 'shop' ? 'bg-primary text-white shadow-lg' : 'bg-muted text-muted-foreground'}`}
            >
              محصولات
            </button>
            <button
              type="button"
              onClick={() => setSearchType('blog')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${searchType === 'blog' ? 'bg-primary text-white shadow-lg' : 'bg-muted text-muted-foreground'}`}
            >
              مجله خبری
            </button>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-3xl opacity-40">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchType === 'shop' ? "جستجو در محصولات آسو شنو..." : "جستجو در مقالات مجله..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-estedad text-foreground placeholder:text-muted-foreground/50 py-4"
            />
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-6 rounded-2xl bg-muted text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-border transition-all active:scale-95"
            >
              بستن
            </button>
          </div>
        </form>

        <div className="max-h-[65vh] overflow-y-auto p-8 no-scrollbar text-right" dir="rtl">
          <div className="space-y-10">
            <div>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 mr-2">دسترسی سریع</h4>
              <div className="flex flex-wrap gap-3">
                {['لپ‌تاپ استوک', 'تعمیر مادربرد', 'ارتقا SSD', 'قیمت روز'].map(tag => (
                  <button key={tag} className="px-5 py-2.5 rounded-2xl bg-secondary border border-border text-xs font-black text-foreground hover:border-primary hover:text-primary transition-all">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 mr-2">محصولات پیشنهادی</h4>
              <div className="space-y-4">
                {results.map(item => (
                  <Link
                    key={item.id}
                    href="/shop/product-details"
                    onClick={onClose}
                    className="flex items-center gap-6 p-4 rounded-[1.5rem] bg-secondary/50 border border-transparent hover:border-primary/20 hover:bg-card transition-all group"
                  >
                    <div className="h-20 w-20 rounded-2xl bg-muted border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <Image src={item.image} alt="" width={64} height={64} className="object-contain p-2 transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex-1 text-right">
                      <h5 className="font-estedad text-xl text-foreground group-hover:text-primary transition-colors">{item.name}</h5>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.category}</span>
                    </div>
                    <div className="text-left">
                       <span className="font-black text-lg text-foreground">{item.price}</span>
                       <span className="text-[10px] font-bold text-muted-foreground mr-1 uppercase">تومان</span>
                    </div>
                  </Link>
                ))}
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
