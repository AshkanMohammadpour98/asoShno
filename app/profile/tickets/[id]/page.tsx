import React from 'react';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getTicketDetails, markAsRead } from '@/lib/actions/tickets';
import { formatJalaliDate, formatJalaliShort } from '@/lib/utils';
import Link from 'next/link';
import MessageForm from './MessageForm';
import MessageList from './MessageList';

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/profile/tickets/${id}`);
  }

  const ticket = await getTicketDetails(id);
  if (!ticket) notFound();

  // Mark messages as read when opening the ticket
  await markAsRead(id);

  const statusMap: Record<string, { label: string, color: string }> = {
    'OPEN': { label: 'در انتظار پاسخ', color: 'bg-blue-500' },
    'IN_PROGRESS': { label: 'در حال بررسی', color: 'bg-orange-500' },
    'ANSWERED': { label: 'پاسخ داده شده', color: 'bg-emerald-500' },
    'CLOSED': { label: 'بسته شده', color: 'bg-gray-500' },
  };

  const status = statusMap[ticket.status] || statusMap['OPEN'];

  return (
    <div className="bg-background min-h-screen pt-4 pb-12 lg:pt-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Back Link */}
        <div className="mb-6 lg:mb-8">
          <Link
            href="/profile/tickets"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-black text-[10px] lg:text-xs group"
          >
            <span className="group-hover:translate-x-1 transition-transform">→</span>
            بازگشت به لیست پیام‌ها
          </Link>
        </div>

        {/* Ticket Header */}
        <div className="bg-card border border-border rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 mb-8 shadow-sm overflow-hidden relative">
           <div className={`absolute top-0 left-0 w-full h-1.5 lg:h-2 ${status.color}`}></div>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="w-full">
                <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-4">
                   <span className={`px-2 py-0.5 lg:px-3 lg:py-1 rounded-lg ${status.color}/10 text-${status.color.split('-')[1]}-600 text-[9px] lg:text-[10px] font-black uppercase tracking-widest border border-${status.color.split('-')[1]}-500/10`}>
                      {status.label}
                   </span>
                   <span className="text-[9px] lg:text-[10px] font-bold text-muted-foreground">ثبت شده در {formatJalaliDate(ticket.createdAt)}</span>
                </div>
                <h1 className="text-2xl lg:text-4xl font-estedad text-foreground tracking-tight leading-tight">{ticket.subject}</h1>
              </div>
              <div className="text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-border/50">
                <p className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">شناسه تیکت</p>
                <p className="font-black text-foreground dir-ltr text-right text-sm lg:text-base">#{ticket.id.slice(0, 8).toUpperCase()}</p>
              </div>
           </div>
        </div>

        {/* Messages List */}
        <MessageList initialMessages={ticket.messages} currentUserId={session.user.id} />

        {/* Reply Form */}
        {ticket.status !== 'CLOSED' ? (
          <div className="bg-card border border-border rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 shadow-xl">
             <h3 className="text-lg lg:text-xl font-bold text-foreground font-estedad mb-6">ارسال پاسخ جدید</h3>
             <MessageForm ticketId={ticket.id} />
          </div>
        ) : (
          <div className="bg-secondary/50 border border-border rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-10 text-center">
             <p className="text-muted-foreground font-bold text-sm lg:text-base">این گفتگو بسته شده است و امکان ارسال پیام جدید وجود ندارد.</p>
          </div>
        )}
      </div>
    </div>
  );
}
