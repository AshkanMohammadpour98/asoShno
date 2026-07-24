"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FiPhone,
  FiMessageCircle,
  FiMapPin,
  FiMail,
  FiInbox,
  FiCheck,
  FiZap,
  FiNavigation,
  FiMap
} from 'react-icons/fi';
import NeshanMap from '@/components/common/NeshanMap';
import { createTicket } from '@/lib/actions/tickets';
import { TicketType } from '@prisma/client';

const contactMethods = [
  {
    title: "تماس مستقیم (مدیریت)",
    value: "۰۹۱۴ ۳۴۲ ۱۶۴۱",
    sub: "پاسخگویی سریع برای موارد ضروری",
    icon: <FiPhone />,
    link: "tel:09143421641",
    color: "bg-indigo-500"
  },
  {
    title: "واتس‌اپ و تلگرام",
    value: "asoshno_laptop",
    sub: "ارسال تصویر و مشخصات قطعات",
    icon: <FiMessageCircle />,
    link: "https://t.me/asoshno_laptop",
    color: "bg-emerald-500"
  },
  {
    title: "مراجعه حضوری",
    value: "اشنویه، خیابان امام",
    sub: "شرکت آسو شنو - شنبه تا پنجشنبه",
    icon: <FiMapPin />,
    link: "https://nshn.ir/_bW7KuYANZqo",
    color: "bg-orange-500"
  },
  {
    title: "ایمیل سازمانی",
    value: "info@asoshno.ir",
    sub: "مکاتبات رسمی و همکاری تجاری",
    icon: <FiMail />,
    link: "mailto:info@asoshno.ir",
    color: "bg-cyan-500"
  }
];

const subjectToType: Record<string, TicketType> = {
  'مشاوره خرید': 'CONTACT',
  'فنی و تعمیرات': 'TECHNICAL',
  'پیگیری بار': 'ORDER_SUPPORT',
  'سایر': 'OTHER'
};

export default function ContactPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({ subject: 'مشاوره خرید', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const mapAddress = "استان آذربایجان غربی، اشنویه، امام، سربازان گمنام";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/contact');
      return;
    }

    if (!formData.message.trim()) {
      setError('لطفاً متن پیام خود را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await createTicket({
        subject: formData.subject,
        type: subjectToType[formData.subject] || 'OTHER',
        content: formData.message
      });

      if (res.success) {
        setIsSuccess(true);
        setFormData({ ...formData, message: '' });
      } else {
        setError(res.error || 'خطایی در ارسال پیام رخ داد.');
      }
    } catch (err: any) {
      setError('یک خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-20 transition-colors duration-300">
      <div className="container mx-auto px-4 pt-24 lg:pt-32">
        {/* Header */}
        <div className="max-w-4xl mb-12 lg:mb-24 animate-fade-in text-right" dir="rtl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 lg:mb-8 border border-primary/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            همیشه در کنار شما هستیم
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h1 className="text-6xl lg:text-9xl font-estedad mb-10 leading-[0.9] text-foreground tracking-tight">
              ارتباط با <br />
              <span className="gradient-text">آسو شنو</span>
            </h1>

            {session && (
              <Link
                href="/profile/tickets"
                className="mb-10 h-16 px-8 rounded-2xl border-2 border-primary/20 bg-primary/5 text-primary flex items-center gap-4 font-black text-sm hover:bg-primary/10 transition-all group"
              >
                <span>مشاهده گفتگوهای قبلی</span>
                <span className="text-xl group-hover:translate-x-[-4px] transition-transform">
                  <FiInbox />
                </span>
              </Link>
            )}
          </div>
          <p className="text-muted-foreground text-xl lg:text-2xl leading-relaxed max-w-2xl font-medium">
            سوالی دارید؟ تیم متخصص ما با ۲۵ سال تجربه آماده ارائه مشاوره رایگان در زمینه خرید لپ‌تاپ‌های وارداتی و تعمیرات تخصصی است.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Contact Cards - Bento Style */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 order-2 lg:order-1" dir="rtl">
            {contactMethods.map((method, index) => (
              <Link
                href={method.link}
                key={index}
                className="bento-card p-8 flex items-start gap-8 group hover:border-primary transition-all bg-card border-border shadow-sm"
              >
                <div className={`h-16 w-16 rounded-3xl ${method.color}/10 ${method.color.replace('bg-', 'text-')} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500`}>
                  {method.icon}
                </div>
                <div className="flex-1 text-right">
                  <h4 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-2">{method.title}</h4>
                  <p className="text-2xl font-black mb-1 dir-ltr text-right text-foreground">{method.value}</p>
                  <p className="text-xs text-muted-foreground font-bold">{method.sub}</p>
                </div>
              </Link>
            ))}

            {/* Operating Hours Card */}
            <div className="bento-card p-10 bg-foreground text-background border-none relative overflow-hidden sm:col-span-2 lg:col-span-1 shadow-2xl">
               <div className="absolute -right-8 -bottom-8 text-9xl opacity-10 rotate-12 italic font-black">24/7</div>
               <h4 className="text-xl font-estedad mb-8 flex items-center gap-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  ساعات کاری و پاسخگویی
               </h4>
               <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center border-b border-background/10 pb-4">
                     <span className="opacity-60 text-sm font-bold">شنبه تا چهارشنبه:</span>
                     <span className="font-black">۹:۰۰ الی ۲۱:۰۰</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-background/10 pb-4">
                     <span className="opacity-60 text-sm font-bold">پنجشنبه‌ها:</span>
                     <span className="font-black">۹:۰۰ الی ۱۸:۰۰</span>
                  </div>
                  <div className="flex justify-between items-center text-primary-foreground">
                     <span className="opacity-60 text-sm font-bold">جمعه‌ها:</span>
                     <span className="font-black text-xs uppercase tracking-widest text-primary-foreground">فقط پاسخگویی آنلاین</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Contact Form - Professional Minimalist */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="bg-card border border-border rounded-[2.5rem] lg:rounded-[4rem] p-8 lg:p-14 shadow-2xl shadow-black/[0.02] relative overflow-hidden transition-colors duration-300">
               <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-primary via-indigo-500 to-cyan-500"></div>

               {isSuccess ? (
                 <div className="text-center py-10 animate-fade-in" dir="rtl">
                    <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl shadow-emerald-500/20">
                      <FiCheck />
                    </div>
                    <h2 className="text-4xl font-estedad mb-6 text-foreground tracking-tight">پیام شما دریافت شد</h2>
                    <p className="text-muted-foreground mb-12 leading-relaxed text-lg font-medium">
                      متخصصین ما در سریع‌ترین زمان ممکن پیام شما را بررسی کرده و پاسخ می‌دهند.
                      شما می‌توانید روند گفتگو را از بخش تیکت‌ها در حساب کاربری خود دنبال کنید.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        href="/profile/tickets"
                        className="h-16 px-10 rounded-2xl bg-primary text-primary-foreground font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center"
                      >
                        مشاهده گفتگوها
                      </Link>
                      <button
                        onClick={() => setIsSuccess(false)}
                        className="h-16 px-10 rounded-2xl bg-secondary text-foreground font-black text-lg hover:bg-muted transition-all"
                      >
                        ارسال پیام جدید
                      </button>
                    </div>
                 </div>
               ) : (
                 <>
                  <div className="mb-16 text-right" dir="rtl">
                      <h2 className="text-4xl font-estedad mb-3 text-foreground tracking-tight">ارسال پیام مستقیم</h2>
                      <p className="text-base text-muted-foreground font-medium">
                        {status === 'unauthenticated'
                          ? 'برای ارسال پیام امن، ابتدا باید وارد حساب کاربری خود شوید.'
                          : 'پیام شما مستقیماً توسط مدیریت مجموعه بررسی خواهد شد.'}
                      </p>
                  </div>

                  <form className="space-y-10 text-right" dir="rtl" onSubmit={handleSubmit}>
                      {status === 'authenticated' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-4">نام و نام خانوادگی</label>
                            <div className="w-full h-18 bg-secondary/50 border-2 border-transparent rounded-2xl px-8 flex items-center text-sm font-black text-foreground/60">
                                {session.user?.name || `${(session.user as any)?.firstName} ${(session.user as any)?.lastName}`}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-4">شماره تماس</label>
                            <div className="w-full h-18 bg-secondary/50 border-2 border-transparent rounded-2xl px-8 flex items-center text-sm font-black text-foreground/60 dir-ltr text-right">
                                {(session.user as any)?.phone}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-4">موضوع درخواست</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {['مشاوره خرید', 'فنی و تعمیرات', 'پیگیری بار', 'سایر'].map((sub) => (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => setFormData({...formData, subject: sub})}
                              className={`py-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all shadow-sm ${
                                formData.subject === sub ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card hover:border-primary/30'
                              }`}
                            >
                                {sub}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center mr-4">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">متن پیام شما</label>
                          <span className="text-[9px] font-bold text-primary">وارد کردن پیام اجباری است</span>
                        </div>
                        <textarea
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          placeholder="جزئیات درخواست یا سوال خود را اینجا بنویسید (مثلاً: قیمت همکاری لپ‌تاپ لنوو)..."
                          className="w-full bg-secondary/50 border-2 border-border/50 focus:border-primary focus:bg-card rounded-[2rem] px-8 py-8 text-sm font-black text-foreground transition-all outline-none resize-none shadow-inner hover:border-primary/30"
                        ></textarea>
                        {error && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 animate-shake">
                            <span className="text-red-500 text-lg">⚠️</span>
                            <p className="text-red-500 text-xs font-black">{error}</p>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || status === 'loading'}
                        className="w-full h-20 rounded-[2rem] bg-foreground text-background font-black text-xl shadow-2xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-6 group disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isSubmitting || status === 'loading' ? (
                          <span className="h-6 w-6 border-4 border-background border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <span>{status === 'unauthenticated' ? 'ورود و ارسال پیام' : 'ارسال پیام امن'}</span>
                            <span className="group-hover:translate-x-[-8px] transition-transform text-2xl">
                              <FiZap />
                            </span>
                          </>
                        )}
                      </button>
                  </form>
                 </>
               )}
            </div>
          </div>
        </div>

        {/* Integrated Location Hub */}
        <div className="mt-24 lg:mt-40 space-y-10 lg:space-y-12" dir="rtl">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/10">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    هم‌اکنون آماده میزبانی هستیم
                 </div>
                 <h2 className="text-4xl lg:text-7xl font-estedad text-foreground tracking-tight">موقعیت <span className="gradient-text">دفتر مرکزی</span></h2>
              </div>
              <p className="text-muted-foreground text-lg font-medium max-w-md leading-relaxed">
                 مجموعه آسو شنو در استراتژیک‌ترین نقطه تجاری اشنویه واقع شده است. برای دسترسی بهتر از جزئیات زیر استفاده کنید.
              </p>
           </div>

           <div className="relative group overflow-hidden bg-card border border-border rounded-[4rem] shadow-2xl transition-all duration-700">
              <div className="flex flex-col lg:flex-row">

                 {/* Sidebar: Information Hub */}
                 <div className="w-full lg:w-[400px] p-8 lg:p-12 flex flex-col justify-between bg-secondary/30 backdrop-blur-xl border-b lg:border-b-0 lg:border-l border-border relative z-10">
                    <div className="space-y-10">
                       <div className="space-y-4">
                          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl shadow-inner">
                            <FiMapPin />
                          </div>
                          <div>
                             <h4 className="text-3xl font-estedad text-foreground mb-1">آسو شنو</h4>
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Aso Shno Headquarters</p>
                          </div>
                       </div>

                       <div className="space-y-8">
                          <div className="group/item">
                             <h5 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-4 h-[1px] bg-primary/30"></span> آدرس پستی
                             </h5>
                             <p className="text-base text-foreground font-bold leading-relaxed">{mapAddress}</p>
                          </div>

                          <div className="group/item">
                             <h5 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-4 h-[1px] bg-primary/30"></span> زمان فعالیت
                             </h5>
                             <div className="flex items-center gap-4">
                                <span className="text-sm text-foreground font-bold">شنبه تا پنجشنبه:</span>
                                <span className="text-sm font-black bg-foreground/5 px-3 py-1 rounded-lg">۰۹:۰۰ - ۲۱:۰۰</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="mt-12 space-y-4">
                       <div className="h-px w-full bg-border"></div>
                       <p className="text-[9px] text-muted-foreground font-bold mb-4">برای مسیریابی سریع از پلتفرم‌های زیر استفاده کنید:</p>
                       <div className="grid grid-cols-2 gap-4">
                          <Link
                            href="https://nshn.ir/_bW7KuYANZqo"
                            target="_blank"
                            className="h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                          >
                             <span>نشان</span>
                             <span className="text-lg">
                               <FiNavigation />
                             </span>
                          </Link>
                          <Link
                            href="https://www.google.com/maps/search/?api=1&query=37.040637,45.094340"
                            target="_blank"
                            className="h-16 rounded-2xl bg-card border border-border text-foreground flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
                          >
                             <span>گوگل مپ</span>
                             <span className="text-lg">
                               <FiMap />
                             </span>
                          </Link>
                       </div>
                    </div>
                 </div>

                 {/* Map Area */}
                 <div className="flex-1 relative h-[450px] lg:h-[750px] bg-muted">
                    <NeshanMap
                      latitude={37.040637}
                      longitude={45.094340}
                    />

                    <div className="absolute top-6 left-6 hidden lg:flex flex-col gap-2">
                       <div className="bg-card/90 backdrop-blur-md border border-border px-4 py-2 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-[9px] font-black text-foreground uppercase tracking-widest">Live System Active</span>
                       </div>
                    </div>
                 </div>

              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
