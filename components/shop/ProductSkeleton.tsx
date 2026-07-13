import React from 'react';
import Skeleton from '../ui/Skeleton';

const ProductSkeleton = () => {
  return (
    <div className="bento-card p-4 space-y-4">
      <Skeleton className="aspect-[4/3] rounded-[1.5rem] w-full" />
      <div className="px-2 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-3 w-24 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="space-y-2">
            <Skeleton className="h-2 w-10 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-12 w-12 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
