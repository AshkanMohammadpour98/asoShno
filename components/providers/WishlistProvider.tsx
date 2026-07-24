"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toggleWishlist as toggleWishlistAction } from '@/lib/actions/wishlist';

interface WishlistContextType {
  wishlist: string[]; // Array of product IDs
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  count: number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children, initialWishlist = [] }: { children: React.ReactNode, initialWishlist?: string[] }) {
  const { data: session, status } = useSession();
  const [wishlist, setWishlist] = useState<string[]>(initialWishlist);
  const [loading, setLoading] = useState(status === 'loading');

  // Load wishlist on mount or session change
  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      // If logged in, we assume the server provided initialWishlist or we might need to fetch it
      // For now, let's rely on initialWishlist or fetch if needed.
      // But usually, initialWishlist is passed from a server component layout.
      setWishlist(initialWishlist);
    } else {
      // If guest, load from localStorage
      const saved = localStorage.getItem('aso-shno-wishlist');
      if (saved) {
        try {
          setWishlist(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse wishlist from local storage');
        }
      }
    }
    setLoading(false);
  }, [session, status, initialWishlist]);

  // Sync guest wishlist to localStorage
  useEffect(() => {
    if (status === 'unauthenticated') {
      localStorage.setItem('aso-shno-wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, status]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (session?.user) {
      // Optimistic update
      setWishlist(prev =>
        prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );

      const res = await toggleWishlistAction(productId);

      if (!res.success) {
        // Rollback on error
        setWishlist(prev =>
          prev.includes(productId)
            ? prev.filter(id => id !== productId)
            : [...prev, productId]
        );
      }
    } else {
      // Guest: local only
      setWishlist(prev =>
        prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
    }

    // Dispatch event for any other listeners
    window.dispatchEvent(new CustomEvent('wishlist-updated'));
  }, [session]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      toggleWishlist,
      isInWishlist,
      count: wishlist.length,
      loading
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
