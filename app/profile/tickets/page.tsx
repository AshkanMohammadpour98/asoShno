import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserTickets } from '@/lib/actions/tickets';
import { formatJalaliDate } from '@/lib/utils';
import Link from 'next/link';

export default async function UserTicketsPage() {
  const session = await auth();
  if (!session) redirect('/login?callbackUrl=/profile/tickets');

  const tickets = await getUserTickets();

  const statusMap: Record<string, { label: string, color: string }> = {
    'OPEN': { label: 'در انتظار پاسخ', color: 'bg-blue-500' },
    'IN_PROGRESS': { label: 'در حال بررسی', color: 'bg-orange-500' },
    'ANSWERED': { label: 'پاسخ داده شده', color: 'bg-emerald-500' },
    'CLOSED': { label: 'بسته شده', color: 'bg-gray-500' },
  };

  const typeMap: Record<string, string> = {
    'CONTACT': 'ارتباط عمومی',
    'REPAIR': 'درخواست تعمیر',
    'ORDER_SUPPORT': 'پشتیبانی سفارش',
    'TECHNICAL': 'پشتیبانی فنی',
    'OTHER': 'سایر موارد',
  };

  return (
    <div className="bg-background min-h-screen pt-32 pb-20 lg:pt-44" dir="rtl">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="text-right">
                <h1 className="text-4xl lg:text-6xl font-estedad mb-4 text-foreground tracking-tight">پیام‌ها و تیکت‌ها</h1>
                <p className="text-muted-foreground text-lg font-medium">تاریخچه گفتگوها و پاسخ‌های پشتیبانی آسو شنو</p>
            </div>
            <Link
              href="/contact"
              className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground flex items-center gap-3 font-black text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              <span>ارسال پیام جدید</span>
              <span className="text-xl">+</span>
            </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-card border border-border rounded-[3rem] p-20 text-center">
            <div className="text-7xl mb-8 opacity-20">📩</div>
            <h3 className="text-2xl font-black text-foreground mb-4">هنوز هیچ پیامی ندارید</h3>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
                اگر سوال یا درخواستی دارید، می‌توانید از طریق فرم تماس با ما، پیام خود را ارسال کنید.
            </p>
            <Link href="/contact" className="inline-flex h-16 px-10 items-center bg-foreground text-background rounded-2xl font-black hover:scale-105 transition-all">
                ارسال اولین پیام
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {tickets.map((ticket) => {
              const lastMessage = ticket.messages[0];
              const status = statusMap[ticket.status] || statusMap['OPEN'];

              return (
                <Link
                  key={ticket.id}
                  href={`/profile/tickets/${ticket.id}`}
                  className="group bg-card border border-border rounded-[2.5rem] p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-8 hover:border-primary transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className={`h-16 w-16 rounded-3xl ${status.color}/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500`}>
                    {ticket.type === 'TECHNICAL' ? '🔧' : ticket.type === 'ORDER_SUPPORT' ? '📦' : '💬'}
                  </div>

                  <div className="flex-1 text-center lg:text-right">
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-3">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{typeMap[ticket.type] || 'سایر'}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">•</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{formatJalaliDate(ticket.createdAt)}</span>
                    </div>
                    <h2 className="text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors">{ticket.subject}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-1 font-medium">
                      {lastMessage?.content || 'بدون پیام'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center lg:items-end gap-4 min-w-[150px]">
                    <div className={`px-4 py-2 rounded-xl ${status.color} text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-${status.color.split('-')[1]}-500/20`}>
                      {status.label}
                    </div>
                    {lastMessage?.isAdmin && !lastMessage?.isRead && (
                      <div className="flex items-center gap-2">
                         <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                         <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">پاسخ جدید</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
