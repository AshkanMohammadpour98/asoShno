import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../providers/CartProvider';
import { getPublicImageUrl } from '@/lib/upload-image';
import { formatPrice } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, updateQty, removeItem, totalAmount, totalCount } = useCart();

  const hasFreeShipping = items.some(i => i.shippingType === 'FREE');

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 z-[70] h-full w-full max-w-[340px] sm:max-w-md bg-card shadow-2xl transition-transform duration-500 ease-out border-r border-border ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full text-right" dir="rtl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 sm:p-8 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-4">
              <span className="text-2xl sm:text-3xl font-estedad text-foreground tracking-tight">سبد خرید</span>
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                {totalCount} کالا
              </span>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-muted flex items-center justify-center hover:bg-border transition-all active:scale-90 border border-border"
              aria-label="Close"
            >
              <span className="text-foreground font-bold text-lg">✕</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 no-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                <span className="text-7xl">🛒</span>
                <p className="font-black text-lg uppercase tracking-widest">سبد خرید شما خالی است</p>
              </div>
            ) : items.map((item) => (
              <div key={`${item.id}-${item.colorName}`} className="flex gap-4 sm:gap-6 group">
                <Link href={`/shop/product/${item.id}`} onClick={onClose} className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-[1.5rem] bg-secondary border border-border overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                  <Image src={getPublicImageUrl(item.image)} alt={item.name} width={80} height={80} className="object-contain p-2 transition-transform group-hover:scale-110" />
                </Link>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <Link href={`/shop/product/${item.id}`} onClick={onClose}>
                    <h4 className="font-estedad text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors leading-tight mb-1 tracking-tight">{item.name}</h4>
                    {item.colorName && (
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{item.colorName}</p>
                    )}
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Original Stock 🇦🇪</p>
                  </Link>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-black text-base sm:text-lg text-foreground">{formatPrice(item.price)} تومان</span>
                    <div className="flex items-center gap-4 bg-muted rounded-xl px-3 py-1.5 border border-border">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1, item.colorName)}
                        className="text-muted-foreground hover:text-foreground font-black transition-colors"
                      >-</button>
                      <span className="text-[10px] font-black text-foreground">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1, item.colorName)}
                        className="text-muted-foreground hover:text-foreground font-black transition-colors"
                      >+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Summary */}
          <div className="p-8 sm:p-10 border-t border-border bg-secondary/50 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-bold">جمع کل اقلام:</span>
                <span className="font-black text-foreground tracking-tight">{formatPrice(totalAmount)} تومان</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-bold">هزینه ارسال:</span>
                {hasFreeShipping ? (
                  <span className="text-emerald-600 font-black uppercase tracking-widest text-[10px]">رایگان (بیمه شده)</span>
                ) : (
                  <span className="text-orange-500 font-black uppercase tracking-widest text-[10px]">نامعلوم (طبق توافق)</span>
                )}
              </div>
              <div className="pt-6 border-t border-border flex justify-between items-end">
                <span className="font-estedad text-2xl text-foreground">مبلغ نهایی</span>
                <div className="text-left" dir="ltr">
                  <span className="font-black text-2xl sm:text-3xl text-primary block leading-none">{formatPrice(totalAmount)}</span>
                  <small className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 block">Toman</small>
                </div>
              </div>
            </div>

            <Link href="/checkout" className="w-full h-16 sm:h-20 rounded-[1.5rem] bg-primary text-primary-foreground font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center hover:translate-y-[-4px] active:translate-y-0 transition-all" onClick={onClose}>
              تکمیل و ثبت نهایی سفارش
            </Link>

            <button onClick={onClose} className="w-full text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-foreground transition-all text-center">
              ادامه گشت و گذار در فروشگاه
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
