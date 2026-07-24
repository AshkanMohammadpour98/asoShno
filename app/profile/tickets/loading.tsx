import React from 'react';

export default function Loading() {
  return (
    <div className="bg-background min-h-screen pt-24 pb-20 lg:pt-44" dir="rtl">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-between items-end gap-6 mb-12">
            <div className="space-y-4 w-full">
                <div className="h-10 w-48 bg-muted animate-pulse rounded-xl"></div>
                <div className="h-6 w-72 bg-muted animate-pulse rounded-lg"></div>
            </div>
        </div>

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-[2.5rem] p-8 flex items-center gap-8 shadow-sm">
              <div className="h-16 w-16 rounded-3xl bg-muted animate-pulse"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                <div className="h-7 w-1/2 bg-muted animate-pulse rounded-lg"></div>
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
