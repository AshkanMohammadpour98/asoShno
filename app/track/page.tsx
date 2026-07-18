import React from 'react';

export default function TrackingPage() {
  return (
    <div className="bg-background min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 py-16 lg:py-24 max-w-5xl text-right" dir="rtl">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-estedad mb-6 text-foreground tracking-tight">رهگیری وضعیت تعمیر</h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-lg font-medium">کد رهگیری پیامک شده را برای مشاهده آخرین وضعیت دستگاه خود وارد کنید.</p>
        </div>

        <div className="flex flex-col gap-10">
          {/* Tracking Input */}
          <div className="bg-card border border-border rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 shadow-sm flex flex-col md:flex-row items-center gap-4 sm:gap-6">
            <div className="relative flex-1 w-full group">
              <input
                type="text"
                placeholder="کد رهگیری (مثلاً: AS-12345)"
                className="w-full bg-secondary border border-border rounded-xl sm:rounded-2xl px-6 sm:px-8 py-4 sm:py-5 text-center font-black tracking-widest text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg sm:text-xl outline-none"
              />
            </div>
            <button className="w-full md:w-auto px-10 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-foreground text-background font-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/5 whitespace-nowrap text-sm sm:text-base">
              بررسی وضعیت
            </button>
          </div>

          {/* Mock Tracking Result */}
          <div className="bg-card border border-border rounded-[3rem] overflow-hidden shadow-sm transition-colors duration-300">
            <div className="p-10 border-b border-border bg-secondary/50 flex flex-wrap justify-between items-center gap-8">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">شماره پرونده مشتری</p>
                <h2 className="text-3xl font-black mt-2 text-foreground">AS-98745</h2>
              </div>
                <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">نام دستگاه و مدل</p>
                <h2 className="text-2xl font-black mt-2 text-foreground">MacBook Pro 14&quot; (2021)</h2>
              </div>
            </div>

            <div className="p-10 lg:p-20">
              <div className="relative mb-20">
                {/* Timeline Line */}
                <div className="absolute top-1/2 left-0 h-1.5 w-full -translate-y-1/2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-primary rounded-full shadow-[0_0_12px_rgba(79,70,229,0.4)]"></div>
                </div>

                {/* Status Points */}
                <div className="relative flex justify-between items-center">
                  {[
                    { label: 'ثبت شده', date: '۱۴ آذر', done: true },
                    { label: 'در حال بررسی', date: '۱۵ آذر', done: true },
                    { label: 'در حال تعمیر', date: '۱۶ آذر', active: true },
                    { label: 'آماده تحویل', date: '-', done: false },
                  ].map((status, i) => (
                    <div key={i} className="flex flex-col items-center gap-5 bg-card px-4">
                      <div className={`h-10 w-10 rounded-2xl border-4 flex items-center justify-center transition-all ${
                        status.done ? 'bg-primary border-primary/20 text-white' :
                        status.active ? 'bg-card border-primary animate-pulse' :
                        'bg-muted border-border'
                      }`}>
                        {status.done && <span className="text-sm font-black text-white">✓</span>}
                        {status.active && <span className="h-2 w-2 rounded-full bg-primary"></span>}
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-black mb-1 ${status.active ? 'text-primary' : status.done ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                          {status.label}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">{status.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10">
                <h4 className="font-black flex items-center gap-3 mb-4 text-primary text-lg">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(79,70,229,0.4)]"></span>
                  گزارش آخرین وضعیت فنی
                </h4>
                <p className="text-base text-muted-foreground leading-relaxed font-medium">
                  قطعه جایگزین (باتری اصلی) تامین شده و در حال نصب بر روی دستگاه می‌باشد. پیش‌بینی می‌شود تا فردا عصر دستگاه کاملاً تست شده و آماده تحویل به مشتری عزیز شود.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
