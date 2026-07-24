"use client";

import React, { useState } from 'react';
import { addMessage } from '@/lib/actions/tickets';

export default function MessageForm({ ticketId }: { ticketId: string }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const res = await addMessage(ticketId, content);
      if (res.success) {
        setContent('');
        setSuccess(true);
        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error || 'خطایی در ارسال پیام رخ داد.');
      }
    } catch (err) {
      console.error(err);
      setError('یک خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="relative">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
          placeholder="پاسخ خود را اینجا بنویسید..."
          className="w-full bg-secondary border-2 border-transparent focus:border-primary focus:bg-card rounded-[1.5rem] lg:rounded-[2rem] px-6 lg:px-8 py-5 lg:py-6 pl-16 lg:pl-20 text-sm font-black text-foreground transition-all outline-none resize-none shadow-inner"
        ></textarea>

        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="absolute left-3 lg:left-4 bottom-3 lg:bottom-4 h-10 w-10 lg:h-12 lg:w-12 rounded-xl lg:rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all disabled:opacity-40 disabled:grayscale disabled:pointer-events-none group/btn"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="text-xl lg:text-2xl group-hover/btn:rotate-12 transition-transform">⚡</span>
          )}
        </button>
      </div>

      <div className="mt-3 px-4 flex justify-between items-center min-h-[20px]">
        {error ? (
          <p className="text-red-500 text-[10px] font-black animate-shake">{error}</p>
        ) : success ? (
          <p className="text-emerald-500 text-[10px] font-black animate-fade-in">✓ پیام با موفقیت ارسال شد</p>
        ) : (
          <p className="text-muted-foreground/40 text-[9px] font-bold">Shift + Enter برای خط بعدی</p>
        )}
      </div>
    </form>
  );
}
