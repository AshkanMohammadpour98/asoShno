"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import UnreadBadge from './UnreadBadge';

const FloatingChatButton = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Pages where we DON'T want the chat button
  const hiddenRoutes = ['/admin', '/login', '/signup', '/checkout'];
  if (hiddenRoutes.some(route => pathname?.startsWith(route))) return null;

  const targetHref = status === 'authenticated' ? '/profile/tickets' : '/login?callbackUrl=/profile/tickets';

  // Don't show if status is loading and we don't know yet (to avoid flickering)
  if (status === 'loading') return null;

  return (
    <div className="fixed bottom-28 left-6 z-[60] lg:bottom-10 lg:left-10 animate-fade-in group">
      <Link
        href={targetHref}
        className="relative h-14 w-14 lg:h-16 lg:w-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-white/10"
      >
        <div className="absolute inset-0 rounded-full animate-ping bg-indigo-600/20 group-hover:hidden"></div>

        {/* Chat Icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-7 h-7 lg:w-8 lg:h-8 group-hover:rotate-12 transition-transform"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.777-.332 48.29 48.29 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>

        {/* Dynamic Unread Badge */}
        <UnreadBadge />
      </Link>

      {/* Tooltip (Desktop) */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 hidden lg:block">
        پشتیبانی آنلاین
      </div>
    </div>
  );
};

export default FloatingChatButton;
