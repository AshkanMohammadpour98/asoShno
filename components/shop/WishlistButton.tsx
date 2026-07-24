"use client";

import React from 'react';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '@/components/providers/WishlistProvider';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

const WishlistButton = ({ productId, className = "" }: WishlistButtonProps) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isLiked = isInWishlist(productId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(productId);
  };

  return (
    <button
      onClick={handleToggle}
      className={`group/wish relative flex items-center justify-center transition-all duration-500 active:scale-75 ${className}`}
      aria-label="Add to wishlist"
    >
      <div className={`absolute inset-0 bg-red-500/10 rounded-full blur-xl transition-opacity duration-500 ${isLiked ? 'opacity-100' : 'opacity-0 group-hover/wish:opacity-100'}`}></div>
      <div className={`absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-border/50 transition-all duration-500 ${isLiked ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover/wish:opacity-100 group-hover/wish:scale-100'}`}></div>

      <FiHeart
        className={`relative z-10 w-1/2 h-1/2 transition-all duration-500 transform ${
          isLiked
          ? 'fill-red-500 stroke-red-500 scale-110'
          : 'fill-transparent stroke-current group-hover/wish:scale-110'
        }`}
      />

      {isLiked && (
          <span className="absolute -top-1 -right-1 z-20 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white dark:border-slate-900"></span>
          </span>
      )}
    </button>
  );
};

export default WishlistButton;
