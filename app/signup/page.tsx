"use client";
import React, { useState, useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerUser, type ActionState } from '@/lib/actions/auth-actions';

const initialState: ActionState = {
  message: '',
  errors: {},
  success: false
};

export default function SignupPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [state, dispatch] = useActionState(registerUser, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => {
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }, 2000);
    }
  }, [state?.success, router, callbackUrl]);

  return (
    <div className="bg-background min-h-screen flex items-center justify-center overflow-hidden py-20 px-4 transition-colors duration-300">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10"></div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-card border border-border rounded-[3rem] p-10 lg:p-14 shadow-2xl shadow-black/[0.02] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-emerald-500 to-cyan-500"></div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-estedad mb-3 text-foreground tracking-tight">ساخت حساب</h1>
            <p className="text-muted-foreground text-sm font-medium">به خانواده آسو شنو بپیوندید</p>
          </div>

          <form action={dispatch} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mr-2 text-right">نام</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="نام"
                  className={`w-full h-14 bg-secondary border-2 border-transparent focus:border-emerald-500 focus:bg-card rounded-2xl px-6 text-sm font-black text-foreground transition-all outline-none text-right ${state?.errors?.firstName ? 'border-red-500/50' : ''}`}
                />
                {state?.errors?.firstName && <p className="text-[9px] text-red-500 mr-2 font-black text-right">{state.errors.firstName[0]}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mr-2 text-right">نام خانوادگی</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="نام خانوادگی"
                  className={`w-full h-14 bg-secondary border-2 border-transparent focus:border-emerald-500 focus:bg-card rounded-2xl px-6 text-sm font-black text-foreground transition-all outline-none text-right ${state?.errors?.lastName ? 'border-red-500/50' : ''}`}
                />
                {state?.errors?.lastName && <p className="text-[9px] text-red-500 mr-2 font-black text-right">{state.errors.lastName[0]}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mr-2 text-right">شماره همراه</label>
              <input
                type="tel"
                name="phone"
                placeholder="۰۹۱۴..."
                className={`w-full h-14 bg-secondary border-2 border-transparent focus:border-emerald-500 focus:bg-card rounded-2xl px-6 text-sm font-black text-foreground transition-all outline-none text-right dir-ltr ${state?.errors?.phone ? 'border-red-500/50' : ''}`}
              />
              {state?.errors?.phone && <p className="text-[9px] text-red-500 mr-2 font-black text-right">{state.errors.phone[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mr-2 text-right">رمز عبور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className={`w-full h-14 bg-secondary border-2 border-transparent focus:border-emerald-500 focus:bg-card rounded-2xl px-6 pl-12 text-sm font-black text-foreground transition-all outline-none text-right ${state?.errors?.password ? 'border-red-500/50' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-emerald-500 transition-colors"
                >
                  {showPassword ? "👀" : "👁️"}
                </button>
              </div>
              {state?.errors?.password && <p className="text-[9px] text-red-500 mr-2 font-black text-right">{state.errors.password[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mr-2 text-right">تکرار رمز عبور</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                className={`w-full h-14 bg-secondary border-2 border-transparent focus:border-emerald-500 focus:bg-card rounded-2xl px-6 text-sm font-black text-foreground transition-all outline-none text-right ${state?.errors?.confirmPassword ? 'border-red-500/50' : ''}`}
              />
              {state?.errors?.confirmPassword && <p className="text-[9px] text-red-500 mr-2 font-black text-right">{state.errors.confirmPassword[0]}</p>}
            </div>

            {state?.message && (
              <p className={`text-xs font-black text-center p-3 rounded-xl ${state.success ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                {state.message}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-4 group mt-6"
            >
              <span>تکمیل ثبت‌نام</span>
              <span className="group-hover:translate-x-[-4px] transition-transform text-2xl">⚡</span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border text-center space-y-4">
            <p className="text-sm font-bold text-muted-foreground">
              قبلاً ثبت‌نام کرده‌اید؟{' '}
              <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-emerald-600 hover:underline">وارد شوید</Link>
            </p>
            <Link href="/" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors block text-center">
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
