"use client";

import React, { useEffect, useState } from 'react';
import { getUnreadCount } from '@/lib/actions/tickets';

export default function UnreadBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const c = await getUnreadCount();
        setCount(c);
      } catch (error) {
        console.error("Failed to fetch unread count", error);
      }
    };

    fetchCount();

    // Listen for custom events to refresh live
    const handleRefresh = () => fetchCount();
    window.addEventListener('unread-count-refresh', handleRefresh);

    // Refresh every 2 minutes as fallback
    const interval = setInterval(fetchCount, 120000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('unread-count-refresh', handleRefresh);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-background animate-pulse flex items-center justify-center">
        {count > 9 ? (
             <span className="text-[7px] text-white font-bold">+9</span>
        ) : (
            <span className="text-[8px] text-white font-bold">{count}</span>
        )}
    </span>
  );
}
