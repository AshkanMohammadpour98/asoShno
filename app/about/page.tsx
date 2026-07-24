import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6 border border-primary/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            بیش از ربع قرن تجربه
          </div>
          <h1 className="text-5xl lg:text-8xl font-estedad mb-8 leading-tight text-foreground tracking-tight">
            داستان <span className="gradient-text">آسو شنو</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            ما از سال ۱۳۷۹ در شهرستان اشنویه فعالیت خود را آغاز کردیم. هدفی که امروز به یک مرجع تخصصی در واردات و تعمیرات لپ‌تاپ تبدیل شده است.
          </p>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="bento-card bg-primary text-primary-foreground p-10 flex flex-col justify-between min-h-[300px] border-none shadow-2xl shadow-primary/20">
            <div className="text-5xl opacity-50">🏆</div>
            <div>
              <h3 className="text-4xl font-estedad mb-2">۲۵ سال</h3>
              <p className="text-primary-foreground/80 font-medium">سابقه درخشان در بازار تکنولوژی</p>
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bento-card bg-card border-border p-10 flex flex-col justify-between">
              <div className="text-4xl">🇦🇪</div>
              <div>
                <h3 className="text-2xl font-estedad mb-2 text-foreground">واردات مستقیم</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">تامین مستقیم از معتبرترین پارتنرهای تجاری در دبی (UAE) بدون واسطه.</p>
              </div>
            </div>
            <div className="bento-card bg-card border-border p-10 flex flex-col justify-between">
              <div className="text-4xl">📦</div>
              <div>
                <h3 className="text-2xl font-estedad mb-2 text-foreground">ارسال کشوری</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">ارسال امن و سریع محصولات به تمام نقاط ایران با بیمه کامل مرسوله.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative aspect-square lg:aspect-video rounded-[3.5rem] overflow-hidden shadow-2xl border-[12px] border-card">
             <Image
              src="/hero/HeroImageJul.png"
              alt="Aso Shno Laptops"
              fill
              className="object-cover scale-110"
             />
             <div className="absolute inset-0 bg-linear-to-t from-foreground/60 to-transparent flex items-end p-12">
                <p className="text-white font-black text-2xl italic tracking-wider">&quot;کیفیت و اصالت، میراث ماست&quot;</p>
             </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-estedad text-foreground tracking-tight">ماموریت ما در اشنویه</h2>
            <p className="text-muted-foreground leading-relaxed text-lg font-medium">
              شرکت آسو شنو با ۲۵ سال سابقه درخشان در قلب شهرستان اشنویه بنا شده است. ما معتقدیم که دسترسی به تکنولوژی روز دنیا با قیمت منصفانه حق تمام هم‌وطنان ماست. به همین دلیل، تمامی لپ‌تاپ‌های ما (اعم از اروپایی و آمریکایی) با حساسیت فراوان انتخاب شده و قبل از عرضه، توسط تیم فنی ما کاملاً تست می‌شوند.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
               {[
                 "تضمین اصالت قطعات",
                 "پشتیبانی فنی ۲۴ ساعته",
                 "قیمت‌های رقابتی و بدون واسطه",
                 "ضمانت بازگشت وجه ۷ روزه"
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(79,70,229,0.4)]"></span>
                    <span className="font-black text-sm text-foreground uppercase tracking-tight">{item}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Location/CTA Card */}
        <div className="rounded-[4rem] bg-secondary border border-border p-12 lg:p-24 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-4xl lg:text-6xl font-estedad mb-8 text-foreground tracking-tight relative z-10">پذیرای حضور گرم شما هستیم</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto leading-loose text-base lg:text-lg font-medium relative z-10">
            استان آذربایجان غربی، شهرستان اشنویه، امام، سربازان گمنام، شرکت آسو شنو.<br/>
            ما هر روز از ساعت ۹ صبح الی ۹ شب آماده ارائه خدمات به شما عزیزان می‌باشیم.
          </p>
          <div className="flex flex-wrap justify-center gap-6 relative z-10">
            <Link href="/contact" className="h-16 px-12 rounded-2xl bg-primary text-primary-foreground font-black text-lg flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95">
               مشاهده روی نقشه
            </Link>
            <Link href="https://instagram.com/asoshno_laptop" target="_blank" className="h-16 px-12 rounded-2xl bg-card border border-border font-black text-foreground flex items-center justify-center hover:bg-muted transition-all shadow-sm">
               دنبال کردن در اینستاگرام
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
