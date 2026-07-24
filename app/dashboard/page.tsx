"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('orders');

  const orders = [
    {
      id: 'ORD-7721',
      date: '۱۴۰۲/۱۰/۱۲',
      status: 'تحویل شده',
      total: '۱۸۵,۰۰۰,۰۰۰',
      item: 'MacBook Pro M3 Max',
      image: '/hero/HeroImageJul.png',
      specs: '36GB RAM / 1TB SSD'
    },
    {
      id: 'ORD-7605',
      date: '۱۴۰۲/۰۹/۰۵',
      status: 'در حال ارسال',
      total: '۴,۵۰۰,۰۰۰',
      item: 'باتری اورجینال مک‌بوک',
      image: '/logo/logo.png',
      specs: 'Model A2337 - 2020'
    },
  ];

  const repairs = [
    {
      id: 'REP-9902',
      date: '۱۴۰۲/۱۰/۱۸',
      status: 'در حال تعمیر',
      device: 'ASUS ROG Strix',
      issue: 'داغ کردن بیش از حد و نیاز به سرویس دوره‌ای',
      progress: 65,
      steps: ['ثبت شده', 'عیب‌یابی', 'تامین قطعه', 'تست نهایی']
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20 max-w-6xl text-right" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

        {/* Profile Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-8 text-center shadow-xl shadow-slate-200/20 dark:shadow-none relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-indigo-500 to-cyan-500 opacity-5 group-hover:opacity-10 transition-opacity"></div>

            <div className="relative pt-6">
              <div className="h-28 w-28 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-900 mx-auto overflow-hidden flex items-center justify-center mb-6 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                <span className="text-5xl">👤</span>
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-1">اشکان عزیز</h2>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                Premium Member
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 space-y-3">
              {[
                { id: 'orders', label: 'سفارشات من', icon: '🛒' },
                { id: 'repairs', label: 'تعمیرات فعال', icon: '🔧' },
                { id: 'wishlist', label: 'علاقه‌مندی‌ها', icon: '❤️' },
                { id: 'profile', label: 'تنظیمات حساب', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                    activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{tab.icon}</span>
                    {tab.label}
                  </div>
                  {activeTab === tab.id && <span className="text-xs">←</span>}
                </button>
              ))}
            </div>

            <button className="mt-10 w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-100 dark:hover:border-red-900/30 transition-all active:scale-95 font-black text-sm">
              خروج از حساب
            </button>
          </div>

          <div className="bg-linear-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
             <div className="absolute -right-6 -top-6 text-[8rem] opacity-10 rotate-12 transition-transform group-hover:rotate-45 duration-700 font-black">25</div>
             <div className="relative z-10">
               <h4 className="text-xl font-black mb-2">باشگاه مشتریان</h4>
               <p className="text-indigo-100 text-xs leading-relaxed mb-8">شما ۲۵ سال همراه ما بوده‌اید! به پاس این اعتماد، تخفیف‌های ویژه‌ای در انتظار شماست.</p>
               <button className="w-full h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">مشاهده جوایز ویژه</button>
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-8 lg:p-12 shadow-sm min-h-[750px] animate-fade-in relative overflow-hidden">

            {activeTab === 'orders' && (
              <div className="space-y-10 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-8">
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white">تاریخچه خرید</h3>
                  <div className="flex gap-2">
                     <button className="h-9 px-5 rounded-xl bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700">همه</button>
                     <button className="h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">جاری</button>
                  </div>
                </div>

                <div className="space-y-8">
                  {orders.map((order) => (
                    <div key={order.id} className="group p-8 rounded-[2.5rem] border border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="relative h-28 w-28 md:h-36 md:w-36 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden flex-shrink-0 p-4 shadow-sm group-hover:scale-105 transition-transform duration-500">
                           <Image src={order.image} alt={order.item} fill className="object-contain p-2" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                               <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">{order.item}</h4>
                               <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{order.specs}</p>
                            </div>
                            <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              order.status === 'تحویل شده'
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                              : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800 animate-pulse'
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-6 pt-8 mt-6 border-t border-slate-100 dark:border-slate-800 border-dashed">
                             <div className="flex gap-10">
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase mb-2">شماره سفارش</p>
                                   <p className="text-sm font-black text-slate-700 dark:text-slate-300 italic">{order.id}</p>
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase mb-2">تاریخ فاکتور</p>
                                   <p className="text-sm font-black text-slate-700 dark:text-slate-300">{order.date}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">مبلغ پرداختی</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{order.total} <small className="font-normal text-xs mr-1 text-slate-400">تومان</small></p>
                             </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 flex justify-end gap-3">
                         <button className="h-11 px-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase hover:bg-slate-200 transition-all">فایل PDF فاکتور</button>
                         <button className="h-11 px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase hover:scale-105 transition-all shadow-lg shadow-black/10">سفارش مجدد</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'repairs' && (
              <div className="space-y-10 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-8">
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white">وضعیت تعمیرات</h3>
                  <Link href="/repair" className="h-11 px-8 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase flex items-center shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all">ثبت درخواست جدید +</Link>
                </div>

                <div className="space-y-8">
                  {repairs.map((repair) => (
                    <div key={repair.id} className="p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 relative overflow-hidden group">
                      <div className="flex flex-wrap justify-between items-center gap-8 mb-12">
                        <div className="flex items-center gap-8">
                           <div className="h-20 w-20 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">🔧</div>
                           <div>
                              <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{repair.device}</h4>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{repair.id} • پذیرش در {repair.date}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-3">وضعیت فعلی دستگاه</p>
                           <span className="px-6 py-2.5 rounded-full text-xs font-black bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 uppercase tracking-widest animate-pulse">
                             {repair.status}
                           </span>
                        </div>
                      </div>

                      {/* Professional Visual Stepper */}
                      <div className="relative mb-16 px-4">
                        <div className="absolute top-1/2 left-0 w-full h-2 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded-full overflow-hidden shadow-inner">
                           <div
                            className="h-full bg-linear-to-r from-indigo-600 via-indigo-400 to-cyan-500 transition-all duration-1000 ease-out"
                            style={{ width: `${repair.progress}%` }}
                           ></div>
                        </div>
                        <div className="relative flex justify-between">
                          {repair.steps.map((step, i) => (
                            <div key={i} className="flex flex-col items-center gap-4">
                               <div className={`h-6 w-6 rounded-full border-4 transition-all duration-700 ${
                                 i <= 1
                                 ? 'bg-indigo-600 border-indigo-100 dark:border-slate-900 scale-150 shadow-lg shadow-indigo-500/20'
                                 : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                               }`}></div>
                               <span className={`text-[10px] font-black uppercase tracking-tighter mt-2 ${i <= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-950 p-8 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 shadow-sm relative">
                         <div className="absolute -top-3 right-8 bg-indigo-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">گزارش فنی</div>
                         <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                            &quot;سلام اشکان عزیز، قطعه باتری اورجینال از انبار دبی تامین شد و بر روی دستگاه شما نصب گردید. در حال حاضر دستگاه زیر تست استرس و پایداری قرار دارد تا از سلامت کامل آن اطمینان حاصل شود.&quot;
                         </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="animate-fade-in space-y-12">
                <h3 className="text-3xl font-black text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-8">تنظیمات پروفایل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">نام و نام خانوادگی</label>
                    <input type="text" defaultValue="اشکان عزیز" className="w-full h-16 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] px-8 text-sm font-black border-2 border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-slate-700 dark:text-slate-200" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">شماره همراه تایید شده</label>
                    <div className="relative">
                      <input type="text" defaultValue="۰۹۱۴ ۳۴۲ ۱۶۴۱" className="w-full h-16 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] px-8 text-sm font-black border-2 border-transparent dir-ltr text-right outline-none opacity-50 cursor-not-allowed text-slate-700 dark:text-slate-200" disabled />
                      <span className="absolute left-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified ✓</span>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">آدرس دقیق تحویل سفارشات</label>
                    <textarea className="w-full bg-slate-50 dark:bg-slate-800 rounded-[2rem] px-8 py-6 text-sm font-black border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none resize-none text-slate-700 dark:text-slate-200" rows={5} defaultValue="آذربایجان غربی، اشنویه، خیابان کارگر، پلاک ۱۲، طبقه اول"></textarea>
                  </div>
                </div>
                <div className="pt-10 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                  <button className="h-16 px-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all">ذخیره تغییرات امن</button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
