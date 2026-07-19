"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BottomNavigation = ({ session }: { session: any }) => {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const user = session?.user;
  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'ADMIN';

  if (pathname?.startsWith('/admin')) return null;

  const navItems = [
    { name: 'خانه', href: '/', icon: '🏠' },
    { name: 'فروشگاه', href: '/shop', icon: '🛒' },
    { name: 'تعمیرات', href: '/repair', icon: '🔧' },
    {
      name: isLoggedIn ? (isAdmin ? 'پنل' : 'حساب') : 'ورود',
      href: isLoggedIn ? (isAdmin ? '/admin' : '/profile') : '/login',
      icon: '👤'
    },
    { name: 'بیشتر', href: '#menu', icon: '✨' },
  ];

  const moreLinks = [
    { name: 'رهگیری سفارش', href: '/track', icon: '📦' },
    { name: 'مجله آسو', href: '/blog', icon: '📖' },
    { name: 'درباره ما', href: '/about', icon: '🏢' },
    { name: 'تماس با ما', href: '/contact', icon: '📞' },
  ];

  return (
    <>
      {/* More Menu Backdrop */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* More Menu Drawer */}
      <div className={`fixed bottom-24 left-4 right-4 z-50 lg:hidden transition-all duration-500 transform ${
        isMoreOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-card/95 backdrop-blur-2xl border border-border rounded-[2.5rem] p-6 shadow-2xl space-y-4">
           {/* Account Section in Mobile Menu */}
           <div className="p-2 border-b border-border/50 pb-6 mb-2">
             {isLoggedIn ? (
               <div className="flex items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                   <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-xl">👤</div>
                   <div>
                     <p className="text-xs font-black text-foreground">{user.firstName} {user.lastName}</p>
                     <p className="text-[10px] text-muted-foreground">{user.phone}</p>
                   </div>
                 </div>
                 <Link
                   href={isAdmin ? "/admin" : "/profile"}
                   onClick={() => setIsMoreOpen(false)}
                   className="h-10 px-4 rounded-xl bg-primary text-white text-[10px] font-black flex items-center justify-center"
                 >
                   {isAdmin ? 'پنل مدیریت' : 'حساب کاربری'}
                 </Link>
               </div>
             ) : (
               <div className="grid grid-cols-2 gap-3">
                 <Link
                   href="/login"
                   onClick={() => setIsMoreOpen(false)}
                   className="h-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center gap-2 text-xs font-black text-foreground"
                 >
                   <span>🔑</span> ورود
                 </Link>
                 <Link
                   href="/signup"
                   onClick={() => setIsMoreOpen(false)}
                   className="h-12 rounded-2xl bg-foreground text-background flex items-center justify-center gap-2 text-xs font-black"
                 >
                   <span>✨</span> ثبت‌نام
                 </Link>
               </div>
             )}
           </div>

           <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 mr-2">منوی اصلی آسو شنو</h4>
           {moreLinks.map((link) => (
             <Link
               key={link.href}
               href={link.href}
               onClick={() => setIsMoreOpen(false)}
               className="flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/10 transition-colors group"
             >
                <span className="text-xl group-hover:scale-110 transition-transform">{link.icon}</span>
                <span className="font-bold text-sm text-foreground">{link.name}</span>
             </Link>
           ))}
        </div>
      </div>

      {/* Main Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-6 pt-2 pointer-events-none">
        <div className="container mx-auto max-w-md pointer-events-auto">
          <div className="glass-effect dark:bg-slate-900/80 border border-border/50 rounded-[2.5rem] shadow-2xl h-18 flex items-center justify-around px-2 relative overflow-hidden">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isMore = item.name === 'بیشتر';

              const content = (
                <div className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                  (isActive || (isMore && isMoreOpen)) ? 'text-primary scale-110' : 'text-muted-foreground'
                }`}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-tight">{item.name}</span>
                </div>
              );

              if (isMore) {
                return (
                  <button
                    key={item.name}
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className="flex-1 h-full flex items-center justify-center relative group"
                  >
                    {content}
                    {(isMoreOpen) && (
                      <div className="absolute bottom-0 w-8 h-1 bg-primary rounded-t-full"></div>
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1 h-full flex items-center justify-center relative group"
                >
                  {content}
                  {isActive && (
                    <div className="absolute bottom-0 w-8 h-1 bg-primary rounded-t-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Spacer for Content */}
      <div className="h-24 lg:hidden"></div>
    </>
  );
};

export default BottomNavigation;
