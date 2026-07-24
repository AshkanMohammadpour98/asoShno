import React from 'react';

export default function Loading() {
  return (
    <div className="bg-background min-h-screen pt-24 pb-20 lg:pt-44" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="h-4 w-32 bg-muted animate-pulse rounded mb-10"></div>

        <div className="bg-card border border-border rounded-[3rem] p-12 mb-8 shadow-sm space-y-4">
           <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
           <div className="h-10 w-3/4 bg-muted animate-pulse rounded-xl"></div>
        </div>

        <div className="space-y-6">
           {[1, 2].map((i) => (
             <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
               <div className="w-2/3 h-32 bg-card border border-border rounded-[2rem] animate-pulse shadow-sm"></div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
