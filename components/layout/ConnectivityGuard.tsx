'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface HealthResponse {
  ok: boolean;
  services?: {
    backend: boolean;
    database: boolean;
  };
}

export default function ConnectivityGuard() {
  const [isOffline, setIsOffline] = useState(false);
  const [isServiceUnavailable, setIsServiceUnavailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showRecoveryMsg, setShowRecoveryMsg] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const router = useRouter();
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const isFormDirty = useRef(false);

  // Detect form activity to prevent unwanted reloads
  useEffect(() => {
    const handleInput = () => {
      isFormDirty.current = true;
    };

    window.addEventListener('input', handleInput);
    window.addEventListener('change', handleInput);

    return () => {
      window.removeEventListener('input', handleInput);
      window.removeEventListener('change', handleInput);
    };
  }, []);

  const checkConnectivity = useCallback(async (isAuto = false) => {
    if (!navigator.onLine) {
      setIsOffline(true);
      setIsServiceUnavailable(false);
      return;
    }

    setIsOffline(false);

    if (!isAuto) setIsChecking(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch('/api/health', {
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data: HealthResponse = await res.json();

      if (data.ok) {
        // If we were previously unavailable, handle recovery
        if (isServiceUnavailable) {
          handleRecovery();
        }
        setIsServiceUnavailable(false);
        setRetryCount(0);
      } else {
        // Only trigger after a few failed attempts if auto-polling
        if (isAuto) {
          setRetryCount(prev => {
            const next = prev + 1;
            if (next >= 2) setIsServiceUnavailable(true);
            return next;
          });
        } else {
          setIsServiceUnavailable(true);
        }
      }
    } catch (error) {
      console.warn('[ConnectivityGuard] Health check failed:', error);
      if (isAuto) {
        setRetryCount(prev => {
          const next = prev + 1;
          if (next >= 2) setIsServiceUnavailable(true);
          return next;
        });
      } else {
        setIsServiceUnavailable(true);
      }
    } finally {
      if (!isAuto) setIsChecking(false);
    }
  }, [isServiceUnavailable]);

  const handleRecovery = () => {
    const lastReload = sessionStorage.getItem('last_recovery_reload');
    const now = Date.now();

    // Prevent reload loop (max 1 reload per 30 seconds)
    if (lastReload && now - parseInt(lastReload) < 30000) {
      setShowRecoveryMsg(true);
      return;
    }

    if (isFormDirty.current) {
      setShowRecoveryMsg(true);
    } else {
      sessionStorage.setItem('last_recovery_reload', now.toString());
      window.location.reload();
    }
  };

  useEffect(() => {
    // Initial check
    checkConnectivity(true);

    const handleOnline = () => {
      setIsOffline(false);
      checkConnectivity(false);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', () => checkConnectivity(true));

    // Listen for multiple image failures
    const handleStorageFailure = () => {
      if (!isServiceUnavailable) {
        checkConnectivity(false);
      }
    };
    window.addEventListener('liara-storage-failure', handleStorageFailure);

    // Polling when unavailable
    checkInterval.current = setInterval(() => {
      if (isOffline || isServiceUnavailable) {
        checkConnectivity(true);
      }
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('liara-storage-failure', handleStorageFailure);
      if (checkInterval.current) clearInterval(checkInterval.current);
    };
  }, [checkConnectivity, isOffline, isServiceUnavailable]);

  if (!isOffline && !isServiceUnavailable && !showRecoveryMsg) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-300">

        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-4xl animate-pulse">
            {isOffline ? '📡' : '🌐'}
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 font-estedad">
          {isOffline ? 'اتصال اینترنت شما قطع است' :
           showRecoveryMsg ? 'اتصال دوباره برقرار شد' :
           'اتصال به سرویس برقرار نشد'}
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
          {isOffline ? (
            'لطفاً وضعیت مودم یا دیتای همراه خود را بررسی کنید. پس از اتصال مجدد، صفحه به‌صورت خودکار به‌روزرسانی می‌شود.'
          ) : showRecoveryMsg ? (
            'دسترسی به فروشگاه دوباره امکان‌پذیر شد. برای مشاهده اطلاعات جدید، صفحه را به‌روزرسانی کنید.'
          ) : (
            <>
              در حال حاضر امکان دریافت اطلاعات فروشگاه وجود ندارد.
              <span className="block mt-2 font-bold text-rose-500">اگر VPN شما روشن است، لطفاً آن را خاموش کنید و چند لحظه منتظر بمانید.</span>
            </>
          )}
        </p>

        <div className="flex flex-col gap-3">
          {showRecoveryMsg ? (
            <button
              onClick={() => window.location.reload()}
              className="h-14 w-full bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              بارگذاری مجدد صفحه
            </button>
          ) : (
            <>
              <button
                onClick={() => checkConnectivity(false)}
                disabled={isChecking}
                className="h-14 w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isChecking && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                بررسی مجدد اتصال
              </button>

              {!isOffline && (
                <button
                  onClick={() => window.location.reload()}
                  className="h-14 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
                >
                  بارگذاری مجدد صفحه
                </button>
              )}
            </>
          )}
        </div>

        {!showRecoveryMsg && (
          <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {isChecking ? 'در حال بررسی وضعیت سرویس...' : 'سیستم پایش هوشمند آسو شنو'}
          </p>
        )}
      </div>
    </div>
  );
}
