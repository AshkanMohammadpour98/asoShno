'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getActiveAnnouncementsAction } from '@/lib/actions/announcements';
import { Announcement } from '@/lib/types';
import { getPublicImageUrl } from '@/lib/upload-image';

const AnnouncementDisplay = () => {
  const pathname = usePathname();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      setIsVisible(false);
      return;
    }
    const fetchAnnouncements = async () => {
      const res = await getActiveAnnouncementsAction();
      if (res.success && res.data && res.data.length > 0) {
        setAnnouncements(res.data);
      }
    };
    fetchAnnouncements();
  }, [pathname]);

  useEffect(() => {
    if (announcements.length > 0) {
      const sorted = [...announcements].sort((a, b) => b.priority - a.priority);

      for (const ann of sorted) {
        const dismissed = localStorage.getItem(`announcement-dismissed-${ann.id}`);
        if (!dismissed) {
          setActiveAnnouncement(ann);
          setIsVisible(true);
          break;
        }
      }
    }
  }, [announcements]);

  const handleDismiss = () => {
    if (activeAnnouncement) {
      localStorage.setItem(`announcement-dismissed-${activeAnnouncement.id}`, 'true');
      setIsVisible(false);
    }
  };

  if (!isVisible || !activeAnnouncement) return null;

  const typeStyles = {
    INFO: 'bg-blue-600 text-white',
    SUCCESS: 'bg-emerald-600 text-white',
    WARNING: 'bg-amber-500 text-white',
    DANGER: 'bg-rose-600 text-white',
  };

  const bannerStyles = {
    INFO: 'bg-blue-50 text-blue-700 border-blue-100',
    SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    WARNING: 'bg-amber-50 text-amber-700 border-amber-100',
    DANGER: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  if (activeAnnouncement.displayMode === 'SMALL') {
    return (
      <div className={`w-full border-b animate-slide-down relative z-[60] font-vazir ${bannerStyles[activeAnnouncement.type]}`} dir="rtl">
        <div className="container mx-auto px-4 h-10 sm:h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/50 flex items-center justify-center text-[10px] sm:text-xs">🔔</span>
            <div className="flex items-center gap-2 overflow-hidden">
              <p className="text-[10px] sm:text-xs font-black truncate">{activeAnnouncement.title}</p>
              <span className="opacity-40 hidden sm:inline">|</span>
              <p className="text-[9px] sm:text-[11px] font-bold opacity-90 truncate">{activeAnnouncement.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {activeAnnouncement.ctaUrl && (
              <Link
                href={activeAnnouncement.ctaUrl}
                className="text-[9px] sm:text-[10px] font-black underline underline-offset-4 hover:opacity-70 transition-opacity whitespace-nowrap"
              >
                {activeAnnouncement.ctaText || 'مشاهده'}
              </Link>
            )}
            {activeAnnouncement.dismissible && (
              <button
                onClick={handleDismiss}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors text-[10px]"
                aria-label="بستن"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LARGE (Modal/Card)
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-vazir" dir="rtl">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in" onClick={activeAnnouncement.dismissible ? handleDismiss : undefined}></div>

      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-zoom-in border border-white/10 flex flex-col max-h-[90vh]">
        {activeAnnouncement.dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 left-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 flex items-center justify-center transition-all"
          >
            ✕
          </button>
        )}

        <div className="overflow-y-auto custom-scrollbar flex-1">
          {activeAnnouncement.imageUrl && (
            <div className="aspect-[16/9] relative overflow-hidden flex-shrink-0">
              <Image
                src={getPublicImageUrl(activeAnnouncement.imageUrl)}
                alt={activeAnnouncement.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
              <div className="absolute bottom-4 right-4 left-4 sm:bottom-6 sm:right-6 sm:left-6">
                 <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2 inline-block ${typeStyles[activeAnnouncement.type]}`}>
                   {activeAnnouncement.type === 'DANGER' ? 'مهم / فوری' : 'اطلاعیه جدید'}
                 </span>
                 <h3 className="text-lg sm:text-2xl font-black text-white line-clamp-2">{activeAnnouncement.title}</h3>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-10 space-y-4 sm:space-y-6">
            {!activeAnnouncement.imageUrl && (
              <div className="space-y-2">
                 <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 inline-block ${typeStyles[activeAnnouncement.type]}`}>
                   {activeAnnouncement.type === 'DANGER' ? 'مهم / فوری' : 'اطلاعیه جدید'}
                 </span>
                 <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{activeAnnouncement.title}</h3>
              </div>
            )}

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs sm:text-sm font-medium">
              {activeAnnouncement.message}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              {activeAnnouncement.ctaUrl && (
                <Link
                  href={activeAnnouncement.ctaUrl}
                  onClick={handleDismiss}
                  className={`flex-1 h-12 sm:h-14 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-black shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-transform ${typeStyles[activeAnnouncement.type]}`}
                >
                  {activeAnnouncement.ctaText || 'مشاهده جزئیات'}
                </Link>
              )}
              {activeAnnouncement.dismissible && (
                <button
                  onClick={handleDismiss}
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-black hover:bg-slate-200 transition-colors"
                >
                  بستن پیام
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDisplay;
