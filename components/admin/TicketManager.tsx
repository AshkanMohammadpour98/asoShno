"use client";

import React, { useEffect, useState } from 'react';
import { getAllTickets, getTicketDetails, addMessage, updateTicketStatus } from '@/lib/actions/tickets';
import { formatJalaliDate } from '@/lib/utils';
import { TicketStatus, TicketType } from '@prisma/client';
import Image from 'next/image';

export default function TicketManager() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [filters, setFilters] = useState<{ status?: TicketStatus }>({});

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await getAllTickets(filters);
      setTickets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const handleSelectTicket = async (id: string) => {
    setSelectedTicketId(id);
    setDetailsLoading(true);
    try {
      const data = await getTicketDetails(id);
      setTicketDetails(data);
    } catch (error) {
      console.error(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicketId || !replyContent.trim()) return;
    try {
      await addMessage(selectedTicketId, replyContent);
      setReplyContent('');
      // Refresh details
      const data = await getTicketDetails(selectedTicketId);
      setTicketDetails(data);
      fetchTickets(); // Refresh list to update last message
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!selectedTicketId) return;
    try {
      await updateTicketStatus(selectedTicketId, newStatus);
      setTicketDetails((prev: any) => ({ ...prev, status: newStatus }));
      fetchTickets();
    } catch (error) {
      console.error(error);
    }
  };

  const statusMap: Record<string, { label: string, color: string }> = {
    'OPEN': { label: 'در انتظار پاسخ', color: 'bg-blue-500' },
    'IN_PROGRESS': { label: 'در حال بررسی', color: 'bg-orange-500' },
    'ANSWERED': { label: 'پاسخ داده شده', color: 'bg-emerald-500' },
    'CLOSED': { label: 'بسته شده', color: 'bg-slate-500' },
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-200px)]">
      {/* Tickets List */}
      <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">لیست تیکت‌ها</h3>
          <div className="flex gap-2">
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ status: e.target.value as TicketStatus || undefined })}
              className="w-full h-10 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 text-[10px] font-black outline-none border border-transparent focus:border-indigo-500"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="OPEN">در انتظار پاسخ</option>
              <option value="ANSWERED">پاسخ داده شده</option>
              <option value="CLOSED">بسته شده</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center p-10 text-slate-400 text-xs font-bold">تیکتی یافت نشد.</div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => handleSelectTicket(ticket.id)}
                className={`w-full text-right p-5 rounded-2xl transition-all border ${
                  selectedTicketId === ticket.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                   <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                     selectedTicketId === ticket.id ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
                   }`}>
                      {ticket.type}
                   </span>
                   <span className="text-[8px] opacity-60">{formatJalaliDate(ticket.lastMessageAt)}</span>
                </div>
                <h4 className="font-black text-sm mb-1 truncate">{ticket.subject}</h4>
                <p className={`text-[10px] truncate ${selectedTicketId === ticket.id ? 'text-white/70' : 'text-slate-400'}`}>
                  {ticket.user.firstName} {ticket.user.lastName}
                </p>
                {!ticket.messages[0]?.isAdmin && !ticket.messages[0]?.isRead && (
                   <div className="flex items-center gap-2 mt-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="text-[8px] font-black text-red-500 uppercase">پاسخ جدید کاربر</span>
                   </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Ticket Details */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {!selectedTicketId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
             <span className="text-6xl mb-4">💬</span>
             <p className="font-black text-sm uppercase tracking-widest">یک تیکت را برای مشاهده انتخاب کنید</p>
          </div>
        ) : detailsLoading ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : ticketDetails ? (
          <>
            {/* Header */}
            <div className="p-6 lg:p-8 border-b border-slate-50 dark:border-slate-800 flex flex-wrap justify-between items-center gap-6">
               <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">{ticketDetails.subject}</h3>
                  <p className="text-xs font-bold text-slate-400">
                    کاربر: {ticketDetails.user.firstName} {ticketDetails.user.lastName} ({ticketDetails.user.phone})
                  </p>
               </div>
               <div className="flex items-center gap-3">
                  <select
                    value={ticketDetails.status}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className="h-10 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 text-[10px] font-black outline-none border border-slate-100 dark:border-slate-700"
                  >
                    <option value="OPEN">در انتظار پاسخ</option>
                    <option value="IN_PROGRESS">در حال بررسی</option>
                    <option value="ANSWERED">پاسخ داده شده</option>
                    <option value="CLOSED">بسته شده</option>
                  </select>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
               {ticketDetails.messages.map((msg: any) => (
                 <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-6 rounded-3xl shadow-sm ${
                      msg.isAdmin
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                    }`}>
                       <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                       <div className={`mt-3 pt-3 border-t text-[8px] font-bold opacity-50 flex justify-between gap-4 ${msg.isAdmin ? 'border-white/10' : 'border-slate-100 dark:border-slate-700'}`}>
                          <span>{formatJalaliDate(msg.createdAt)} - {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>{msg.isRead ? 'خوانده شده' : 'نرسیده'}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {/* Reply Area */}
            <div className="p-6 lg:p-8 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
               <div className="flex flex-col gap-4">
                  <textarea
                    rows={3}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="پاسخ خود را اینجا بنویسید..."
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-xs font-bold outline-none border-2 border-transparent focus:border-indigo-600 resize-none transition-all"
                  ></textarea>
                  <div className="flex justify-end">
                    <button
                      onClick={handleSendReply}
                      disabled={!replyContent.trim()}
                      className="h-12 px-10 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all disabled:opacity-50"
                    >
                      ارسال پاسخ به کاربر
                    </button>
                  </div>
               </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
