"use client";

import React, { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { toggleWishlist, getWishlistStatus } from '@/lib/actions/wishlist';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

const WishlistButton = ({ productId, className = "" }: WishlistButtonProps) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      const res = await getWishlistStatus(productId);
      if (res.success) {
        setIsInWishlist(res.isInWishlist);
      }
    }
    checkStatus();
  }, [productId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    const res = await toggleWishlist(productId);
    setLoading(false);

    if (res.success) {
      setIsInWishlist(res.action === 'ADDED');
      // Trigger a custom event for any listeners (like the dashboard)
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
    } else if (res.error === 'NOT_AUTHENTICATED') {
      router.push('/login');
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative flex items-center justify-center transition-all duration-300 active:scale-75 ${className}`}
    >
      <div className={`absolute inset-0 bg-red-500 rounded-full blur-md opacity-0 transition-opacity duration-300 ${isInWishlist ? 'group-hover:opacity-20' : ''}`}></div>
      <FiHeart
        className={`w-full h-full transition-all duration-500 transform ${
          isInWishlist
          ? 'fill-red-500 stroke-red-500 scale-110'
          : 'fill-transparent stroke-current group-hover:scale-110'
        } ${loading ? 'animate-pulse' : ''}`}
      />
      {isInWishlist && (
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
      )}
    </button>
  );
};

export default WishlistButton;
