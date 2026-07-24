import React from 'react';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getTicketDetails, markAsRead } from '@/lib/actions/tickets';
import { formatJalaliDate, formatJalaliShort } from '@/lib/utils';
import Link from 'next/link';
import MessageForm from './MessageForm';

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect(`/login?callbackUrl=/profile/tickets/${params.id}`);

  const ticket = await getTicketDetails(params.id);
  if (!ticket) notFound();

  // Mark admin messages as read when user opens the ticket
  if (session.user.role !== 'ADMIN') {
    await markAsRead(params.id);
  }

  const statusMap: Record<string, { label: string, color: string }> = {
    'OPEN': { label: 'در انتظار پاسخ', color: 'bg-blue-500' },
    'IN_PROGRESS': { label: 'در حال بررسی', color: 'bg-orange-500' },
    'ANSWERED': { label: 'پاسخ داده شده', color: 'bg-emerald-500' },
    'CLOSED': { label: 'بسته شده', color: 'bg-gray-500' },
  };

  const status = statusMap[ticket.status] || statusMap['OPEN'];

  return (
    <div className="bg-background min-h-screen pt-32 pb-20 lg:pt-44" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Back Link */}
        <Link
          href="/profile/tickets"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-black text-xs mb-10 group"
        >
          <span className="group-hover:translate-x-1 transition-transform">→</span>
          بازگشت به لیست پیام‌ها
        </Link>

        {/* Ticket Header */}
        <div className="bg-card border border-border rounded-[3rem] p-8 lg:p-12 mb-8 shadow-sm overflow-hidden relative">
           <div className={`absolute top-0 left-0 w-full h-2 ${status.color}`}></div>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                   <span className={`px-3 py-1 rounded-lg ${status.color}/10 text-${status.color.split('-')[1]}-600 text-[10px] font-black uppercase tracking-widest border border-${status.color.split('-')[1]}-500/10`}>
                      {status.label}
                   </span>
                   <span className="text-[10px] font-bold text-muted-foreground">ثبت شده در {formatJalaliDate(ticket.createdAt)}</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-estedad text-foreground tracking-tight">{ticket.subject}</h1>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">شناسه تیکت</p>
                <p className="font-black text-foreground dir-ltr text-right">#{ticket.id.slice(0, 8).toUpperCase()}</p>
              </div>
           </div>
        </div>

        {/* Messages List */}
        <div className="space-y-6 mb-12">
           {ticket.messages.map((msg) => (
             <div
               key={msg.id}
               className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
             >
               <div className={`max-w-[85%] sm:max-w-[70%] p-6 lg:p-8 rounded-[2rem] shadow-sm relative ${
                 msg.isAdmin
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : 'bg-card border border-border text-foreground rounded-tl-none'
               }`}>
                  {msg.isAdmin && (
                    <div className="flex items-center gap-2 mb-3">
                       <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">🏢</div>
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-80">پاسخ پشتیبانی آسو شنو</span>
                    </div>
                  )}
                  <p className="text-base leading-relaxed font-medium whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <div className={`mt-4 pt-4 border-t ${msg.isAdmin ? 'border-white/10' : 'border-border'} flex justify-between items-center`}>
                    <span className="text-[9px] font-bold opacity-60">
                      {formatJalaliDate(msg.createdAt)} - ساعت {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!msg.isAdmin && (
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                          {msg.isRead ? 'خوانده شده ✓✓' : 'ارسال شده ✓'}
                       </span>
                    )}
                  </div>
               </div>
             </div>
           ))}
        </div>

        {/* Reply Form */}
        {ticket.status !== 'CLOSED' ? (
          <div className="bg-card border border-border rounded-[3rem] p-8 lg:p-10 shadow-xl">
             <h3 className="text-xl font-bold text-foreground font-estedad mb-6">ارسال پاسخ جدید</h3>
             <MessageForm ticketId={ticket.id} />
          </div>
        ) : (
          <div className="bg-secondary/50 border border-border rounded-[2.5rem] p-10 text-center">
             <p className="text-muted-foreground font-bold">این گفتگو بسته شده است و امکان ارسال پیام جدید وجود ندارد.</p>
          </div>
        )}
      </div>
    </div>
  );
}
