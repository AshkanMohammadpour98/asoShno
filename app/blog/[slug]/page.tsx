import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getLocalBlogPosts } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicImageUrl } from '@/lib/upload-image';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getLocalBlogPosts();
  const post = posts.find(p => p.slug === slug);

  if (!post) return { title: 'مقاله پیدا نشد' };

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.featuredImage }],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getLocalBlogPosts();
  const post = posts.find(p => p.slug === slug);

  if (!post || post.status !== 'published') {
    notFound();
  }

  const relatedPosts = posts
    .filter(p => p.id !== post.id && p.status === 'published' && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="bg-background min-h-screen transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative h-[60vh] lg:h-[80vh] w-full overflow-hidden">
        <Image
          src={getPublicImageUrl(post.featuredImage)}
          alt={post.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent"></div>

        <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 pb-16 lg:pb-24 text-right" dir="rtl">
          <div className="max-w-4xl space-y-8 animate-fade-in">
             <span className="bg-primary px-6 py-2 rounded-full text-xs font-black text-primary-foreground uppercase tracking-widest w-fit shadow-xl shadow-primary/20">
               {post.category}
             </span>
             <h1 className="text-4xl lg:text-7xl font-extrabold text-foreground leading-tight tracking-tight">
               {post.title}
             </h1>
             <div className="flex items-center gap-6 text-sm font-black text-muted-foreground uppercase tracking-widest">
                <span>توسط آسو شنو</span>
                <span className="h-2 w-2 rounded-full bg-primary/30"></span>
                <span>{new Date(post.createdAt).toLocaleDateString('fa-IR')}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 lg:py-32" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Main Content */}
          <article className="lg:col-span-8 text-right space-y-12">
             <div className="bg-card p-8 lg:p-12 rounded-[3.5rem] border border-border shadow-2xl shadow-black/[0.02] relative">
                {/* Excerpt/Intro */}
                {post.excerpt && (
                  <div className="text-xl lg:text-2xl font-bold text-primary leading-relaxed mb-12 border-r-8 border-primary pr-8 italic">
                     {post.excerpt}
                  </div>
                )}

                {/* Article Content */}
                <div
                  className="prose prose-xl dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
             </div>

             {/* Tags */}
             {post.tags && post.tags.length > 0 && (
               <div className="flex flex-wrap gap-3 pt-12">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-5 py-2.5 bg-muted rounded-2xl text-[10px] font-black text-muted-foreground border border-border uppercase tracking-widest">
                      #{tag}
                    </span>
                  ))}
               </div>
             )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
             {/* Related Posts */}
             {relatedPosts.length > 0 && (
               <div className="space-y-8">
                  <h4 className="text-xl font-black text-foreground border-r-4 border-primary pr-4">مقالات مشابه</h4>
                  <div className="grid grid-cols-1 gap-6">
                    {relatedPosts.map(rp => (
                      <Link key={rp.id} href={`/blog/${rp.slug}`} className="group flex items-center gap-4 p-4 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all shadow-sm">
                         <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden">
                            <Image
                              src={getPublicImageUrl(rp.featuredImage)}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                         </div>
                         <div>
                            <span className="text-[9px] font-black text-primary uppercase">{rp.category}</span>
                            <h5 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{rp.title}</h5>
                         </div>
                      </Link>
                    ))}
                  </div>
               </div>
             )}

             {/* CTA Bento */}
             <div className="bento-card p-10 bg-foreground text-background border-none shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-all"></div>
                <h4 className="text-2xl font-black mb-6 relative z-10">مشاوره تخصصی خرید</h4>
                <p className="text-xs font-bold text-background/60 leading-relaxed mb-8 relative z-10">
                   اگر هنوز در انتخاب لپ‌تاپ مناسب تردید دارید، همین حالا با کارشناسان آسو شنو در اشنویه تماس بگیرید.
                </p>
                <Link href="/contact" className="inline-flex h-12 items-center px-8 rounded-xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all relative z-10">
                   تماس با ما
                </Link>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
