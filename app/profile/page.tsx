import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { signOut } from '@/lib/auth';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-secondary py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-[3rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden text-right">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-8 mb-12">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl border-4 border-primary/20">
              👤
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-black text-foreground mb-2">حساب کاربری</h1>
              <p className="text-muted-foreground font-medium">خوش آمدید، {user.firstName} {user.lastName}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">اطلاعات پایه</h3>
              <div className="bg-muted p-6 rounded-2xl space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">نام و نام خانوادگی</label>
                  <p className="text-lg font-black">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">شماره همراه</label>
                  <p className="text-lg font-black dir-ltr">{user.phone}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">نقش کاربری</label>
                  <p className="text-sm font-black px-3 py-1 bg-primary/10 text-primary rounded-full inline-block">
                    {user.role === 'ADMIN' ? 'مدیر سیستم' : 'مشتری'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">دسترسی‌های سریع</h3>
              <div className="grid grid-cols-1 gap-4">
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="w-full h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-black hover:scale-[1.02] transition-all">
                    پنل مدیریت
                  </Link>
                )}
                <Link href="/" className="w-full h-16 bg-secondary text-foreground rounded-2xl flex items-center justify-center font-black hover:scale-[1.02] transition-all border border-border">
                  بازگشت به صفحه اصلی
                </Link>
                <Link href="/shop" className="w-full h-16 bg-muted text-foreground border border-border rounded-2xl flex items-center justify-center font-black hover:bg-border transition-all">
                  مشاهده فروشگاه
                </Link>
                <form action={async () => {
                  "use server";
                  await signOut();
                }}>
                  <button type="submit" className="w-full h-16 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center font-black hover:bg-red-500/20 transition-all">
                    خروج از حساب
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
