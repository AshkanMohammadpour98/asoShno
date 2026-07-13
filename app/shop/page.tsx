import { useSearchParams, useRouter } from 'next/navigation';
import type { LocalProduct, LocalCategory, LocalBrand } from '@/lib/types';

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [brands, setBrands] = useState<LocalBrand[]>([]);

  // Get filters from URL
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [prodRes, catRes, brandRes] = await Promise.all([
        getProducts({ search, category, brand }),
        getCategories(),
        getBrands()
      ]);

      if (prodRes.success) setProducts(prodRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
      if (brandRes.success) setBrands(brandRes.data || []);

      setIsLoading(false);
    }
    loadData();
  }, [search, category, brand]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/shop?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/shop');
  };

  return (
    <div className="bg-background min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 pt-32 pb-12 lg:pt-44 lg:pb-20 text-right" dir="rtl">
        {/* Page Header */}
        <div className="mb-16">
          <h1 className="text-4xl lg:text-7xl font-extrabold mb-6 text-foreground tracking-tight">ویترین محصولات</h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">تکنولوژی روز اروپا و آمریکا، مستقیماً از بازارهای دبی تا شهرستان اشنویه.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center justify-center gap-3 w-full h-16 rounded-[2rem] bg-card font-black border border-border shadow-sm text-foreground transition-all active:scale-95"
          >
            <span className="text-xl">🔍</span>
            <span>{showMobileFilters ? 'بستن فیلترها' : 'جستجوی هوشمند و فیلتر'}</span>
          </button>

          {/* Sidebar Filters */}
          <aside className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 space-y-8 sticky top-24 h-fit animate-fade-in`}>
            <div className="bg-card border border-border rounded-[3rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-bold tracking-tight text-foreground">فیلترهای دقیق</h3>
                 <button
                  onClick={clearFilters}
                  className="text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70"
                 >
                    پاکسازی
                 </button>
              </div>

              <div className="space-y-10">
                {/* Search in Shop */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-5 mr-1">جستجوی متنی</label>
                  <input
                    type="text"
                    placeholder="چی لازم داری؟..."
                    value={search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="w-full h-12 bg-muted/50 rounded-2xl px-6 font-bold text-xs outline-none border-2 border-transparent focus:border-primary"
                  />
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-5 mr-1">برند</label>
                  <div className="space-y-3">
                    <button
                      onClick={() => updateFilter('brand', '')}
                      className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${!brand ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      همه برندها
                    </button>
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => updateFilter('brand', b.id)}
                        className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${brand === b.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-5 mr-1">دسته‌بندی</label>
                  <div className="space-y-3">
                    <button
                      onClick={() => updateFilter('category', '')}
                      className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${!category ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      همه دسته‌ها
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => updateFilter('category', cat.id)}
                        className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${category === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 bg-card border border-border rounded-[2rem] px-8 py-5 gap-6 shadow-sm">
              <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                <span className="text-primary">{products.length}</span> محصول یافت شد
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <Link href={`/shop/product/${product.id}`} key={product.id} className="bento-card group p-5 border-border bg-card flex flex-col hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                    <div className="aspect-[4/3] rounded-[2rem] bg-muted/50 mb-6 flex items-center justify-center relative overflow-hidden border border-transparent group-hover:border-primary/20 transition-all duration-700">
                      <Image
                        src={getPublicImageUrl(product.images?.[0])}
                        alt={product.name}
                        fill
                        className="object-contain p-8 transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <div className="absolute top-5 right-5 flex flex-col gap-2">
                          <span className="bg-card/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black border border-border uppercase tracking-widest shadow-sm text-foreground">
                            {product.categories?.name}
                          </span>
                          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 self-end">
                            {product.brands?.name}
                          </span>
                      </div>
                    </div>

                    <div className="px-3 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                           <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"></span>
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">موجود در انبار</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate mb-1">{product.name}</h3>

                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-border">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1">قیمت نهایی</span>
                          <span className="font-black text-2xl text-foreground leading-none tracking-tight">{Number(product.price).toLocaleString()} <small className="text-[10px] font-normal mr-1 text-muted-foreground">تومان</small></span>
                        </div>
                        <div className="h-14 w-14 rounded-[1.5rem] bg-primary text-primary-foreground flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-primary/20 active:scale-90 relative overflow-hidden">
                          <span className="text-2xl z-10">🛒</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-muted-foreground font-black">هیچ محصولی پیدا نشد.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
