'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductsByIds } from '@/lib/actions/products';
import { LocalProduct } from '@/lib/types';
import ProductSelector from '@/components/shop/ProductSelector';
import { useCart } from '@/components/providers/CartProvider';
import { formatPrice } from '@/lib/utils';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    if (ids.length > 0) {
      loadProducts(ids);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  async function loadProducts(targetIds: string[]) {
    setLoading(true);
    const result = await getProductsByIds(targetIds);
    if (result.success && result.data) {
      // Keep the order of IDs from URL
      const sorted = (result.data as LocalProduct[]).sort((a, b) =>
        targetIds.indexOf(a.id) - targetIds.indexOf(b.id)
      );
      setProducts(sorted);
    }
    setLoading(false);
  }

  const handleAddProduct = (newProduct: LocalProduct) => {
    const newIds = [...ids, newProduct.id];
    router.push(`/compare?ids=${newIds.join(',')}`);
    setIsSelectorOpen(false);
  };

  const handleRemoveProduct = (id: string) => {
    const newIds = ids.filter(i => i !== id);
    if (newIds.length === 0) {
      router.push('/shop');
    } else {
      router.push(`/compare?ids=${newIds.join(',')}`);
    }
  };

  // Collect all unique spec keys from all products
  const allSpecKeys = Array.from(new Set(
    products.flatMap(p => (p.specs as any[] || []).map(s => s.key))
  ));

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">در حال آماده‌سازی مقایسه...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-20" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-estedad font-black mb-2">مقایسه محصولات</h1>
            <p className="text-muted-foreground text-sm font-medium">ویژگی‌ها و مشخصات فنی کالاها را در کنار هم بررسی کنید.</p>
          </div>
          <Link href="/shop" className="text-primary font-bold hover:underline">بازگشت به فروشگاه</Link>
        </div>

        <div className="bg-card border border-border rounded-[3rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-64 p-8 text-right bg-muted/30 font-black text-sm uppercase tracking-widest text-muted-foreground">مشخصات کالا</th>
                  {products.map((product) => (
                    <th key={product.id} className="min-w-[280px] p-8 align-top relative border-r border-border first:border-r-0">
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="absolute top-4 left-4 h-8 w-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                      <div className="space-y-6">
                        <div className="relative aspect-square w-32 mx-auto bg-muted rounded-2xl overflow-hidden">
                          <Image
                            src={product.images[0] || '/logo/logo.png'}
                            alt={product.name}
                            fill
                            className="object-contain p-4"
                          />
                        </div>
                        <div className="text-center space-y-3">
                          <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem] leading-relaxed">{product.name}</h3>
                          <div className="text-xl font-black text-primary">
                            {product.variants && product.variants.some(v => v.price && Number(v.price) !== Number(product.price))
                              ? `از ${formatPrice(Math.min(Number(product.price), ...product.variants.filter(v => v.price).map(v => Number(v.price))))}`
                              : formatPrice(product.price)
                            } <small className="text-xs font-normal mr-1 text-muted-foreground">تومان</small>
                          </div>
                          <button
                            onClick={() => {
                              const firstVariant = product.variants?.[0];
                              const price = firstVariant?.price ? Number(firstVariant.price) : Number(product.price);
                              addItem({
                                id: product.id,
                                name: product.name,
                                price: price,
                                image: product.images[0] || '/logo/logo.png',
                                qty: 1,
                                colorName: firstVariant?.colorName || 'استاندارد',
                                shippingType: product.shippingType
                              });
                            }}
                            className="w-full py-3 rounded-xl bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest border border-border hover:bg-primary hover:text-white hover:border-primary transition-all"
                          >
                            🛒 افزودن به سبد
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                  {products.length < 4 && (
                    <th className="min-w-[280px] p-8 align-top border-r border-border">
                      <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[2rem] p-12 space-y-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => setIsSelectorOpen(true)}>
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-3xl">➕</div>
                        <p className="font-black text-xs uppercase tracking-widest text-muted-foreground">افزودن کالا برای مقایسه</p>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-muted/10">
                  <td className="p-6 font-black text-xs text-muted-foreground uppercase tracking-widest">برند</td>
                  {products.map(p => (
                    <td key={p.id} className="p-6 text-sm font-bold border-r border-border first:border-r-0">
                      {p.brands?.name || '—'}
                    </td>
                  ))}
                  {products.length < 4 && <td className="border-r border-border"></td>}
                </tr>
                <tr className="border-b border-border">
                  <td className="p-6 font-black text-xs text-muted-foreground uppercase tracking-widest">وضعیت</td>
                  {products.map(p => (
                    <td key={p.id} className="p-6 text-sm font-bold border-r border-border first:border-r-0">
                      <span className={p.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {p.stock > 0 ? '✅ موجود' : '❌ ناموجود'}
                      </span>
                    </td>
                  ))}
                  {products.length < 4 && <td className="border-r border-border"></td>}
                </tr>
                <tr className="border-b border-border bg-muted/10">
                  <td className="p-6 font-black text-xs text-muted-foreground uppercase tracking-widest">شرایط کالا</td>
                  {products.map(p => (
                    <td key={p.id} className="p-6 text-sm font-bold border-r border-border first:border-r-0">
                      {p.condition || '—'}
                    </td>
                  ))}
                  {products.length < 4 && <td className="border-r border-border"></td>}
                </tr>

                {/* Dynamic Specs */}
                {allSpecKeys.map((key, idx) => (
                  <tr key={key} className={`border-b border-border ${idx % 2 === 1 ? 'bg-muted/10' : ''}`}>
                    <td className="p-6 font-black text-xs text-muted-foreground uppercase tracking-widest">{key}</td>
                    {products.map(p => {
                      const spec = (p.specs as any[] || []).find(s => s.key === key);
                      return (
                        <td key={p.id} className="p-6 text-sm font-bold border-r border-border first:border-r-0">
                          {spec?.value || '—'}
                        </td>
                      );
                    })}
                    {products.length < 4 && <td className="border-r border-border"></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {products.length > 0 && (
          <ProductSelector
            isOpen={isSelectorOpen}
            onClose={() => setIsSelectorOpen(false)}
            onSelect={handleAddProduct}
            categoryId={products[0].category_id}
            excludeIds={products.map(p => p.id)}
          />
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
