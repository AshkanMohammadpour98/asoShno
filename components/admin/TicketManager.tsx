"use client";

import React, { useEffect, useState } from 'react';
import { getAllTickets, getTicketDetails, addMessage, updateTicketStatus, markAsRead, startConversation, deleteTicket, deleteMessage, editMessage } from '@/lib/actions/tickets';
import { formatJalaliDate } from '@/lib/utils';
import { TicketStatus } from '@prisma/client';
import Image from 'next/image';

interface Ticket {
  id: string;
  subject: string;
  type: string;
  status: TicketStatus;
  lastMessageAt: string | Date;
  user: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  messages: any[];
  _count: {
    messages: number;
  };
}

export default function TicketManager({ initialUserId, initialTicketId }: { initialUserId?: string, initialTicketId?: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialTicketId || null);
  const [ticketDetails, setTicketDetails] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newTicketData, setNewTicketData] = useState({ subject: 'پیام از طرف پشتیبانی', content: '' });
  const [isStartingNew, setIsStartingNew] = useState(false);
  const [filters, setFilters] = useState<{ status?: TicketStatus, userId?: string }>({
    userId: initialUserId
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await getAllTickets(filters);
      setTickets(data as unknown as Ticket[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    if (initialTicketId) {
      handleSelectTicket(initialTicketId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, initialTicketId]);

  const handleSelectTicket = async (id: string) => {
    setSelectedTicketId(id);
    setDetailsLoading(true);
    try {
      const data = await getTicketDetails(id);
      setTicketDetails(data as unknown as Ticket);
      await markAsRead(id);
      // Notify other components (like Navbar badge) to refresh unread count
      window.dispatchEvent(new CustomEvent('unread-count-refresh'));
      fetchTickets(); // Refresh list to update unread status in list
    } catch (error) {
      console.error(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicketId || !replyContent.trim()) return;
    try {
      const res = await addMessage(selectedTicketId, replyContent);
      if (res.success) {
        setReplyContent('');
        // Refresh details
        const data = await getTicketDetails(selectedTicketId);
        setTicketDetails(data as unknown as Ticket);
        fetchTickets(); // Refresh list to update last message
      } else {
        alert(res.error || 'خطا در ارسال پاسخ');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartConversation = async () => {
    if (!initialUserId || !newTicketData.subject.trim() || !newTicketData.content.trim()) return;
    try {
      const res = await startConversation(initialUserId, newTicketData.subject, newTicketData.content);
      if (res.success) {
        setIsStartingNew(false);
        setNewTicketData({ subject: 'پیام از طرف پشتیبانی', content: '' });
        fetchTickets();
        if (res.data?.id) handleSelectTicket(res.data.id);
      } else {
        alert(res.error || 'خطا در ایجاد گفتگو');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!selectedTicketId) return;
    try {
      await updateTicketStatus(selectedTicketId, newStatus);
      setTicketDetails((prev: any) => prev ? ({ ...prev, status: newStatus }) : null);
      fetchTickets();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicketId) return;
    if (!confirm('آیا از حذف کامل این گفتگو و تمامی پیام‌های آن اطمینان دارید؟ این عملیات غیرقابل بازگشت است.')) return;

    try {
      const res = await deleteTicket(selectedTicketId);
      if (res.success) {
        setSelectedTicketId(null);
        setTicketDetails(null);
        fetchTickets();
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('آیا از حذف این پیام اطمینان دارید؟')) return;

    try {
      const res = await deleteMessage(messageId);
      if (res.success) {
        const data = await getTicketDetails(selectedTicketId!);
        setTicketDetails(data as unknown as Ticket);
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateMessage = async () => {
    if (!editingMessageId || !editContent.trim()) return;

    try {
      const res = await editMessage(editingMessageId, editContent);
      if (res.success) {
        setEditingMessageId(null);
        setEditContent('');
        const data = await getTicketDetails(selectedTicketId!);
        setTicketDetails(data as unknown as Ticket);
      } else {
        alert(res.error);
      }
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
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-auto lg:h-[calc(100vh-200px)]">
      {/* Tickets List */}
      <div className={`w-full lg:w-96 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden ${selectedTicketId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-5 lg:p-6 border-b border-slate-50 dark:border-slate-800">
          <h3 className="text-lg lg:text-xl font-black text-slate-800 dark:text-white mb-4">لیست تیکت‌ها</h3>
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

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[70vh] lg:max-h-none">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center p-10 space-y-4">
              <p className="text-slate-400 text-[10px] font-bold">تیکتی یافت نشد.</p>
              {filters.userId && (
                <button
                  onClick={() => setIsStartingNew(true)}
                  className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-lg shadow-lg shadow-indigo-500/20"
                >
                  شروع گفتگوی جدید 📨
                </button>
              )}
            </div>
          ) : (
            <>
              {filters.userId && (
                <button
                  onClick={() => {
                    setSelectedTicketId(null);
                    setTicketDetails(null);
                    setIsStartingNew(true);
                  }}
                  className="w-full py-3 mb-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-xl border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  <span>+ ایجاد گفتگوی جدید برای این کاربر</span>
                </button>
              )}
              {tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => handleSelectTicket(ticket.id)}
                className={`w-full text-right p-4 lg:p-5 rounded-2xl transition-all border ${
                  selectedTicketId === ticket.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <span className={`text-[7px] lg:text-[8px] font-black px-2 py-0.5 rounded-md ${
                        selectedTicketId === ticket.id ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
                      }`}>
                          {ticket.type}
                      </span>
                      <span className={`text-[7px] lg:text-[8px] font-black px-2 py-0.5 rounded-md ${
                        selectedTicketId === ticket.id ? 'bg-white/10' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {ticket._count.messages} پیام
                      </span>
                   </div>
                   <span className="text-[8px] opacity-60">{formatJalaliDate(ticket.lastMessageAt)}</span>
                </div>
                <h4 className="font-black text-xs lg:text-sm mb-1 truncate">{ticket.subject}</h4>
                <p className={`text-[9px] lg:text-[10px] truncate ${selectedTicketId === ticket.id ? 'text-white/70' : 'text-slate-400'}`}>
                  {ticket.user.firstName} {ticket.user.lastName}
                </p>
                {ticket.messages && ticket.messages[0] && !ticket.messages[0].isAdmin && !ticket.messages[0].isRead && (
                   <div className="flex items-center gap-2 mt-2">
                      <span className="h-1 w-1 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="text-[7px] lg:text-[8px] font-black text-red-500 uppercase tracking-widest">پاسخ جدید کاربر</span>
                   </div>
                )}
              </button>
            ))}
            </>
          )}
        </div>
      </div>

      {/* Ticket Details */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px] lg:min-h-0 ${(!selectedTicketId && !isStartingNew) ? 'hidden lg:flex' : 'flex'}`}>
        {isStartingNew ? (
          <div className="flex-1 flex flex-col p-6 lg:p-12 animate-fade-in">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-white">شروع گفتگوی جدید</h3>
                <button onClick={() => setIsStartingNew(false)} className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">✕</button>
             </div>

             <div className="space-y-8 max-w-2xl">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">موضوع گفتگو</label>
                   <input
                      type="text"
                      value={newTicketData.subject}
                      onChange={(e) => setNewTicketData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="مثلا: پیگیری سفارش شماره ۱۲۳"
                      className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600 transition-all"
                   />
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">متن اولین پیام</label>
                   <textarea
                      rows={6}
                      value={newTicketData.content}
                      onChange={(e) => setNewTicketData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="پیام خود را اینجا بنویسید..."
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-[2rem] p-6 text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600 resize-none transition-all"
                   ></textarea>
                </div>

                <button
                   onClick={handleStartConversation}
                   disabled={!newTicketData.subject.trim() || !newTicketData.content.trim()}
                   className="w-full h-16 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                   ارسال پیام و شروع گفتگو
                </button>
             </div>
          </div>
        ) : !selectedTicketId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
             <span className="text-5xl lg:text-6xl mb-4">💬</span>
             <p className="font-black text-[10px] lg:text-sm uppercase tracking-widest">یک تیکت را برای مشاهده انتخاب کنید</p>
          </div>
        ) : detailsLoading ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="h-8 w-8 lg:h-10 lg:w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : ticketDetails ? (
          <>
            {/* Header */}
            <div className="p-5 lg:p-8 border-b border-slate-50 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
               <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedTicketId(null)} className="lg:hidden h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">→</button>
                  <div>
                    <h3 className="text-base lg:text-xl font-black text-slate-800 dark:text-white mb-1 line-clamp-1">{ticketDetails.subject}</h3>
                    <p className="text-[9px] lg:text-xs font-bold text-slate-400">
                      کاربر: {ticketDetails.user.firstName} {ticketDetails.user.lastName} ({ticketDetails.user.phone})
                    </p>
                  </div>
               </div>
               <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={ticketDetails.status}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className="flex-1 sm:flex-none h-10 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 text-[10px] font-black outline-none border border-slate-100 dark:border-slate-700"
                  >
                    <option value="OPEN">در انتظار پاسخ</option>
                    <option value="IN_PROGRESS">در حال بررسی</option>
                    <option value="ANSWERED">پاسخ داده شده</option>
                    <option value="CLOSED">بسته شده</option>
                  </select>
                  <button
                    onClick={handleDeleteTicket}
                    className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm"
                    title="حذف کل گفتگو"
                  >
                    🗑️
                  </button>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 lg:p-10 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
               {ticketDetails.messages.map((msg: any) => (
                 <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] lg:max-w-[80%] p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm relative group/msg ${
                      msg.isAdmin
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                    }`}>
                       {msg.isAdmin && (
                          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                             <button onClick={() => { setEditingMessageId(msg.id); setEditContent(msg.content); }} className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center text-[10px] hover:bg-white/30 transition-all">✏️</button>
                             <button onClick={() => handleDeleteMessage(msg.id)} className="h-7 w-7 rounded-lg bg-red-500/20 flex items-center justify-center text-[10px] hover:bg-red-500/40 transition-all">🗑️</button>
                          </div>
                       )}

                       {editingMessageId === msg.id ? (
                          <div className="space-y-3 pt-2">
                             <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs font-bold text-white outline-none focus:bg-white/20"
                                rows={3}
                             ></textarea>
                             <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingMessageId(null)} className="px-3 py-1 rounded-lg bg-white/10 text-[10px] font-black">انصراف</button>
                                <button onClick={handleUpdateMessage} className="px-3 py-1 rounded-lg bg-white text-indigo-600 text-[10px] font-black">ذخیره</button>
                             </div>
                          </div>
                       ) : (
                          <p className="text-xs lg:text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                       )}

                       <div className={`mt-3 pt-3 border-t text-[7px] lg:text-[8px] font-bold opacity-50 flex justify-between gap-4 ${msg.isAdmin ? 'border-white/10' : 'border-slate-100 dark:border-slate-700'}`}>
                          <span>{formatJalaliDate(msg.createdAt)} - {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>{msg.isRead ? 'خوانده شده' : 'ارسال شده'}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {/* Reply Area */}
            <div className="p-5 lg:p-8 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
               <div className="flex flex-col gap-4">
                  <textarea
                    rows={3}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="پاسخ خود را اینجا بنویسید..."
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-[11px] lg:text-xs font-bold outline-none border-2 border-transparent focus:border-indigo-600 resize-none transition-all"
                  ></textarea>
                  <div className="flex justify-end">
                    <button
                      onClick={handleSendReply}
                      disabled={!replyContent.trim()}
                      className="w-full sm:w-auto h-12 px-10 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all disabled:opacity-50"
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
