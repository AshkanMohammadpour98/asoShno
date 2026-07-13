"use client";
import React, { useState } from 'react';

const steps = [
  { id: 1, title: 'نوع دستگاه', icon: '💻' },
  { id: 2, title: 'برند و مدل', icon: '🏷️' },
  { id: 3, title: 'شرح مشکل', icon: '🔧' },
  { id: 4, title: 'اطلاعات تماس', icon: '📞' },
];

const deviceTypes = [
  { name: 'لپ‌تاپ', icon: '💻', desc: 'انواع نوت‌بوک و لپ‌تاپ' },
  { name: 'مک‌بوک', icon: '🍏', desc: 'محصولات اپل (Air & Pro)' },
  { name: 'کامپیوتر', icon: '🖥️', desc: 'کیس و سیستم‌های خانگی' },
  { name: 'آیمک', icon: '🖥️', desc: 'All-in-One اپل' },
];

const commonIssues = [
  'روشن نمی‌شود', 'داغ می‌کند', 'شکستگی صفحه نمایش', 'ارتقا سرعت (SSD)', 'ریختن مایعات', 'خرابی باتری', 'مشکل کیبورد', 'سایر موارد'
];

export default function RepairPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const toggleIssue = (issue: string) => {
    setSelectedIssue(prev =>
      prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
    );
  };

  if (isSubmitted) {
    return (
      <div className="bg-background min-h-[70vh] flex items-center justify-center p-4 transition-colors duration-300">
        <div className="container mx-auto max-w-2xl text-center animate-fade-in">
          <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-xl shadow-emerald-500/20">
            ✓
          </div>
          <h2 className="text-4xl font-estedad mb-6 text-foreground tracking-tight">درخواست شما با موفقیت ثبت شد</h2>
          <p className="text-muted-foreground mb-12 leading-relaxed text-lg font-medium">
            کارشناسان فنی آسو شنو در کمتر از ۲ ساعت کاری با شما تماس خواهند گرفت تا هماهنگی‌های لازم جهت دریافت دستگاه را انجام دهند. کد پیگیری شما: <span className="text-primary font-black tracking-widest">AS-77842</span>
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="h-16 px-12 rounded-2xl bg-primary text-primary-foreground font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 py-16 lg:py-24 max-w-6xl text-right" dir="rtl">
        <div className="text-center mb-20">
          <h1 className="text-5xl lg:text-7xl font-estedad mb-6 text-foreground tracking-tight">مرکز تخصصی تعمیرات</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg font-medium">
            با ۲۵ سال سابقه در اشنویه، دستگاه شما را مثل روز اول احیا می‌کنیم. ضمانت رسمی ۶ ماهه برای تمامی قطعات.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Progress Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-5 group">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all ${
                    currentStep === step.id ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-110' :
                    currentStep > step.id ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep === step.id ? 'text-primary' : 'text-muted-foreground'}`}>
                      مرحله {step.id}
                    </span>
                    <span className={`text-base font-black ${currentStep === step.id ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                      {step.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-9">
            <div className="bg-card border border-border rounded-[3.5rem] p-8 lg:p-16 shadow-sm min-h-[600px] flex flex-col transition-all">

              {/* Step 1: Device Type */}
              {currentStep === 1 && (
                <div className="animate-fade-in flex-1">
                  <h3 className="text-3xl font-estedad mb-10 text-foreground tracking-tight">نوع دستگاه خود را مشخص کنید</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {deviceTypes.map((type) => (
                      <button
                        key={type.name}
                        onClick={() => setSelectedDevice(type.name)}
                        className={`flex items-center gap-8 p-8 rounded-[2.5rem] border-2 transition-all text-right group ${
                          selectedDevice === type.name ? 'border-primary bg-primary/5' : 'border-muted bg-secondary/50 hover:border-primary/20'
                        }`}
                      >
                        <div className="h-20 w-20 rounded-3xl bg-card border border-border flex items-center justify-center text-5xl group-hover:scale-110 transition-transform shadow-sm">
                          {type.icon}
                        </div>
                        <div>
                          <h4 className={`font-black text-xl ${selectedDevice === type.name ? 'text-primary' : 'text-foreground'}`}>{type.name}</h4>
                          <p className="text-sm text-muted-foreground mt-2 font-medium">{type.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Brand & Model */}
              {currentStep === 2 && (
                <div className="animate-fade-in flex-1">
                  <h3 className="text-3xl font-estedad mb-10 text-foreground tracking-tight">برند و مدل دستگاه چیست؟</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                    {['Apple', 'Asus', 'Lenovo', 'HP', 'Dell', 'Acer', 'MSI', 'سایر'].map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`py-5 rounded-2xl border-2 font-black text-sm transition-all shadow-sm ${
                          selectedBrand === brand ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-muted hover:border-primary/30 text-muted-foreground'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mr-4">مدل دقیق (اختیاری)</label>
                    <input
                      type="text"
                      placeholder="مثلاً: ROG Strix G15 یا MacBook A2337"
                      className="w-full h-18 bg-secondary border-2 border-transparent focus:border-primary focus:bg-card rounded-2xl px-8 text-sm font-black text-foreground transition-all outline-none shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Issues */}
              {currentStep === 3 && (
                <div className="animate-fade-in flex-1">
                  <h3 className="text-3xl font-estedad mb-10 text-foreground tracking-tight">مشکل دستگاه را انتخاب کنید</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    {commonIssues.map((issue) => (
                      <button
                        key={issue}
                        onClick={() => toggleIssue(issue)}
                        className={`flex items-center justify-between p-6 rounded-[1.5rem] border-2 font-black transition-all text-right shadow-sm ${
                          selectedIssue.includes(issue) ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-muted hover:border-primary/20 text-muted-foreground'
                        }`}
                      >
                        <span className="text-base">{issue}</span>
                        <div className={`h-7 w-7 rounded-xl flex items-center justify-center border-2 transition-all ${selectedIssue.includes(issue) ? 'bg-primary border-primary text-white' : 'border-border'}`}>
                           {selectedIssue.includes(issue) && <span className="text-sm">✓</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mr-4">توضیحات بیشتر</label>
                    <textarea
                      rows={5}
                      placeholder="اگر نکته خاصی وجود دارد اینجا بنویسید..."
                      className="w-full bg-secondary border-2 border-transparent focus:border-primary focus:bg-card rounded-[2.5rem] px-8 py-8 text-sm font-black text-foreground transition-all outline-none resize-none shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Contact Info */}
              {currentStep === 4 && (
                <div className="animate-fade-in flex-1">
                  <h3 className="text-3xl font-estedad mb-10 text-foreground tracking-tight">اطلاعات تماس و دریافت دستگاه</h3>
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mr-4">نام و نام خانوادگی</label>
                        <input type="text" placeholder="نام شما" className="w-full h-18 bg-secondary border-2 border-transparent focus:border-primary focus:bg-card rounded-2xl px-8 text-sm font-black text-foreground transition-all outline-none shadow-sm" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mr-4">شماره همراه</label>
                        <input type="tel" placeholder="۰۹۱۴..." className="w-full h-18 bg-secondary border-2 border-transparent focus:border-primary focus:bg-card rounded-2xl px-8 text-sm font-black text-foreground transition-all outline-none dir-ltr text-right shadow-sm" />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mr-4">نحوه تحویل دستگاه</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <button className="flex items-center justify-between p-8 rounded-[2rem] border-2 border-primary bg-primary/5 text-primary font-black text-sm shadow-xl shadow-primary/5">
                           <span>ارسال با پیک / تیپاکس</span>
                           <div className="h-7 w-7 rounded-full border-[6px] border-primary bg-card"></div>
                        </button>
                        <button className="flex items-center justify-between p-8 rounded-[2rem] border-2 border-border bg-muted text-muted-foreground font-black text-sm hover:border-primary/40 transition-all">
                           <span>مراجعه حضوری (اشنویه)</span>
                           <div className="h-7 w-7 rounded-full border-2 border-border"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-16 pt-12 border-t border-border flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`h-16 px-10 rounded-2xl font-black text-sm transition-all ${
                    currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ← مرحله قبلی
                </button>

                <button
                  onClick={currentStep === 4 ? () => setIsSubmitted(true) : nextStep}
                  className="h-18 px-16 rounded-[1.5rem] bg-foreground text-background font-black text-lg shadow-2xl shadow-black/10 hover:scale-105 active:scale-95 transition-all"
                >
                  {currentStep === 4 ? 'ثبت نهایی درخواست' : 'گام بعدی →'}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10 px-2 sm:px-0">
           {[
             { icon: '🛡️', title: 'ضمانت ۶ ماهه', desc: 'تمامی قطعات تعویضی دارای گارانتی رسمی آسو شنو هستند.' },
             { icon: '🚀', title: 'تحویل اکسپرس', desc: '۸۰٪ تعمیرات در کمتر از ۴۸ ساعت کاری انجام می‌شود.' },
             { icon: '💰', title: 'تضمین قیمت', desc: 'حذف واسطه‌ها یعنی کمترین قیمت برای قطعات اصلی.' },
           ].map((info, i) => (
             <div key={i} className="text-center p-12 bento-card bg-card border-border shadow-md transition-all hover:shadow-xl">
                <div className="text-6xl mb-8">{info.icon}</div>
                <h4 className="font-estedad text-2xl mb-4 text-foreground">{info.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{info.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
