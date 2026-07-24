'use client';

import { useState, useEffect } from 'react';

// Define the BeforeInstallPromptEvent type for TypeScript
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      console.log('[PWA] Running in standalone mode, skipping prompt');
      return;
    }

    // 2. Check if user dismissed it recently
    const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (isDismissed) {
      console.log('[PWA] Prompt was dismissed by user');
      return;
    }

    // 3. Logic to handle and store the prompt
    const handlePrompt = (e?: any) => {
      const prompt = e || (window as any).deferredPrompt;
      if (prompt) {
        console.log('[PWA] Installation prompt available!');
        setDeferredPrompt(prompt);
        setShowPrompt(true);
      }
    };

    // Check window immediately (for late mounting components)
    handlePrompt();

    // Listen for custom event from layout.tsx
    window.addEventListener('pwa-prompt-available', handlePrompt);

    // Listen for native event (for early mounting components)
    const handler = (e: any) => {
      e.preventDefault();
      console.log('[PWA] beforeinstallprompt event received');
      (window as any).deferredPrompt = e;
      handlePrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 4. Listen for successful installation
    const installedHandler = () => {
      console.log('[PWA] App installed successfully');
      setShowPrompt(false);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('pwa-prompt-available', handlePrompt);
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    // Try to get from state, fallback to window
    const promptToUse = deferredPrompt || (window as any).deferredPrompt;

    if (!promptToUse) {
      console.warn('[PWA] No prompt available to trigger installation');
      setShowPrompt(false);
      return;
    }

    try {
      // Trigger the browser's install prompt
      await promptToUse.prompt();

      // Wait for user choice
      const { outcome } = await promptToUse.userChoice;
      console.log(`[PWA] User choice: ${outcome}`);

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
        setShowPrompt(false);
      }
    } catch (err) {
      console.error('[PWA] Installation failed:', err);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
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
          onClick={handleDismiss}
          className="px-5 bg-muted text-muted-foreground h-11 rounded-xl text-xs font-bold hover:bg-muted/80 transition-all"
        >
          فعلاً نه
        </button>
      </div>

      <button
        onClick={handleDismiss}
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  );
}
