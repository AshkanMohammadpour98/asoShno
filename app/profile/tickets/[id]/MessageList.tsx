"use client";

import React, { useState } from 'react';
import { formatJalaliDate } from '@/lib/utils';
import { editMessage, deleteMessage } from '@/lib/actions/tickets';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  isRead: boolean;
  createdAt: Date | string;
  senderId: string;
}

export default function MessageList({ initialMessages, currentUserId }: { initialMessages: Message[], currentUserId: string }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Notify Navbar that unread count might have changed (since markAsRead is called on the server before this page renders)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('unread-count-refresh'));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این پیام اطمینان دارید؟')) return;
    const res = await deleteMessage(id);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !editContent.trim()) return;
    const res = await editMessage(editingId, editContent);
    if (res.success) {
      setEditingId(null);
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 mb-12">
      {initialMessages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
        >
          <div className={`max-w-[90%] sm:max-w-[70%] p-5 lg:p-7 rounded-[1.5rem] lg:rounded-[2rem] shadow-sm relative group/msg ${
            msg.isAdmin
              ? 'bg-primary text-primary-foreground rounded-tr-none'
              : 'bg-card border border-border text-foreground rounded-tl-none'
          }`}>
            {/* Action Buttons for non-admin messages sent by the current user */}
            {!msg.isAdmin && msg.senderId === currentUserId && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingId(msg.id); setEditContent(msg.content); }}
                  className="h-7 w-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-[10px] hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="h-7 w-7 rounded-lg bg-red-500/10 flex items-center justify-center text-[10px] hover:bg-red-500/20 transition-all"
                >
                  🗑️
                </button>
              </div>
            )}

            {msg.isAdmin && (
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-white/20 flex items-center justify-center text-[8px] lg:text-[10px]">🏢</div>
                <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest opacity-80">پاسخ پشتیبانی آسو شنو</span>
              </div>
            )}

            {editingId === msg.id ? (
              <div className="space-y-3">
                 <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-border/20 rounded-xl p-3 text-sm font-medium outline-none focus:bg-black/10"
                    rows={3}
                 ></textarea>
                 <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="px-3 py-1 rounded-lg bg-black/5 text-[10px] font-black">انصراف</button>
                    <button onClick={handleUpdate} className="px-3 py-1 rounded-lg bg-primary text-white text-[10px] font-black">ذخیره</button>
                 </div>
              </div>
            ) : (
              <p className="text-sm lg:text-base leading-relaxed font-medium whitespace-pre-wrap">
                {msg.content}
              </p>
            )}

            <div className={`mt-4 pt-4 border-t ${msg.isAdmin ? 'border-white/10' : 'border-border'} flex justify-between items-center`}>
              <span className="text-[8px] lg:text-[9px] font-bold opacity-60">
                {formatJalaliDate(msg.createdAt)} - ساعت {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {!msg.isAdmin && (
                <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest opacity-60">
                  {msg.isRead ? 'خوانده شده ✓✓' : 'ارسال شده ✓'}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
