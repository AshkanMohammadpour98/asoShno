'use client';

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      return;
    }

    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-28 left-4 right-4 z-[60] md:bottom-8 md:left-auto md:right-8 md:w-96 bg-card/95 backdrop-blur-md border border-border shadow-2xl p-5 rounded-[2rem] flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">
          📱
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-black text-foreground">اپلیکیشن آسو شنو را نصب کنید</h3>
          <p className="text-xs text-muted-foreground mt-1">
            برای دسترسی سریع‌تر و تجربه بهتر، نسخه اپلیکیشن را به صفحه اصلی اضافه کنید.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 bg-primary text-primary-foreground h-11 rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          نصب اپلیکیشن
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="px-5 bg-muted text-muted-foreground h-11 rounded-xl text-xs font-bold hover:bg-muted/80 transition-all"
        >
          فعلاً نه
        </button>
      </div>

      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  );
}
