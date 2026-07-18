"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts, getBlogCategories } from '@/lib/actions/blog';
import { getPublicImageUrl } from '@/lib/upload-image';
import { useSearchParams, useRouter } from 'next/navigation';
import type { BlogPost, BlogCategory } from '@/lib/types';

export default function BlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [postsRes, catRes] = await Promise.all([
        getBlogPosts({ search, category }),
        getBlogCategories()
      ]);

      if (postsRes.success) setAllPosts((postsRes.data || []).filter(p => p.status === 'published'));
      if (catRes.success) setCategories(catRes.data || []);
      setIsLoading(false);
    }
    loadData();
  }, [search, category]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/blog?${params.toString()}`);
  };

  const featuredPost = allPosts.find(p => p.isFeatured) || allPosts[0];
  const regularPosts = featuredPost ? allPosts.filter(p => p.id !== featuredPost.id) : allPosts;

  return (
    <div className="bg-background min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 pt-32 pb-16 lg:pt-44 lg:pb-24 text-right" dir="rtl">
        {/* Header Section */}
        <div className="text-center mb-24 animate-fade-in">
          <h1 className="text-5xl lg:text-8xl font-extrabold mb-8 leading-tight text-foreground tracking-tight">
            مجله <span className="gradient-text">تکنولوژی</span> آسو شنو
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg lg:text-xl font-medium leading-relaxed">
            آخرین اخبار دنیای سخت‌افزار، راهنمای خرید تخصصی و مقالات آموزشی از زبان متخصصین فنی آسو شنو.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-muted-foreground">در حال بارگذاری مقالات...</p>
          </div>
        ) : allPosts.length > 0 ? (
          <>
            {/* Featured Post (Bento Large) */}
            {featuredPost && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="lg:col-span-8 group relative aspect-video lg:aspect-auto lg:h-[550px] rounded-[3.5rem] overflow-hidden border border-border shadow-2xl shadow-black/[0.02]"
                >
                  <Image
                    src={getPublicImageUrl(featuredPost.featuredImage)}
                    alt={featuredPost.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    priority
                    sizes="(max-width: 1024px) 100vw, 800px"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-foreground/90 via-foreground/20 to-transparent flex flex-col justify-end p-8 lg:p-16">
                    <span className="bg-primary px-5 py-2 rounded-full text-[10px] font-black text-primary-foreground uppercase tracking-widest w-fit mb-6 shadow-lg shadow-primary/20">
                      {featuredPost.category}
                    </span>
                    <h2 className="text-3xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1] transition-colors tracking-tight">
                      {featuredPost.title}
                    </h2>
                    <p className="text-white/70 text-base lg:text-lg max-w-2xl line-clamp-2 mb-8 font-medium">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-6 text-xs font-black text-white/50 uppercase tracking-widest">
                       <span>آسو شنو</span>
                       <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                       <span>{new Date(featuredPost.createdAt).toLocaleDateString('fa-IR')}</span>
                    </div>
                  </div>
                </Link>

                {/* Categories / Search Side Bento */}
                <div className="lg:col-span-4 grid grid-cols-1 gap-8">
                   <div className="bento-card bg-card border border-border p-8 sm:p-10 flex flex-col gap-6 sm:gap-8 shadow-sm">
                      <h3 className="text-xl font-bold text-foreground">جستجو در مقالات</h3>
                      <div className="relative group">
                        <input
                          type="text"
                          placeholder="دنبال چی می‌گردی؟..."
                          value={search}
                          onChange={(e) => updateFilter('search', e.target.value)}
                          className="w-full h-14 bg-muted/50 rounded-2xl px-12 font-bold text-sm outline-none border-2 border-transparent focus:border-primary transition-all focus:bg-background"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
                      </div>
                   </div>

                   <div className="bento-card bg-foreground text-background p-10 flex flex-col justify-between border-none shadow-xl">
                      <h3 className="text-2xl font-bold mb-8 text-background">دسته‌بندی‌ها</h3>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => updateFilter('category', '')}
                          className={`px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${!category ? 'bg-primary text-primary-foreground' : 'bg-background/10 text-background hover:bg-background/20'}`}
                        >
                          همه مقالات
                        </button>
                         {categories.map(cat => (
                           <button
                            key={cat.id}
                            onClick={() => updateFilter('category', cat.name)}
                            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${category === cat.name ? 'bg-primary text-primary-foreground' : 'bg-background/10 text-background hover:bg-background/20'}`}
                           >
                             {cat.name}
                           </button>
                         ))}
                         {categories.length === 0 && <span className="text-xs opacity-50">دسته‌بندی ثبت نشده است</span>}
                      </div>
                   </div>
                   <div className="bento-card p-10 bg-linear-to-br from-primary to-cyan-600 text-primary-foreground border-none flex flex-col justify-center text-center shadow-2xl shadow-primary/20">
                      <h4 className="font-bold text-3xl mb-4 text-white">عضویت در خبرنامه</h4>
                      <p className="text-sm font-medium opacity-80 mb-10 text-white">جدیدترین مقالات و تخفیف‌های ویژه اشنویه را دریافت کنید</p>
                      <div className="relative">
                        <input type="email" placeholder="ایمیل شما" className="w-full h-16 rounded-2xl bg-white/20 border-none px-8 text-sm font-black placeholder:text-white/50 focus:ring-2 focus:ring-white text-white transition-all" />
                        <button className="absolute left-1.5 top-1.5 h-13 px-8 rounded-xl bg-white text-primary text-xs font-black shadow-lg">تایید</button>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {regularPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden border border-border bg-muted mb-8 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <Image
                      src={getPublicImageUrl(post.featuredImage)}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-5 right-5">
                       <span className="bg-card/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black border border-border uppercase tracking-widest shadow-lg text-foreground">
                         {post.category}
                       </span>
                    </div>
                  </div>
                  <div className="px-4">
                    <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                       <span>{new Date(post.createdAt).toLocaleDateString('fa-IR')}</span>
                       <span className="h-1.5 w-1.5 rounded-full bg-primary/30"></span>
                       <span>آسو شنو</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight text-foreground tracking-tight">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 opacity-50">
             <p className="text-2xl font-black">هنوز مقاله‌ای منتشر نشده است.</p>
          </div>
        )}
      </div>
    </div>
  );
}
