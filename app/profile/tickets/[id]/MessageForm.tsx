"use client";

import React, { useState } from 'react';
import { addMessage } from '@/lib/actions/tickets';

export default function MessageForm({ ticketId }: { ticketId: string }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await addMessage(ticketId, content);
      setContent('');
    } catch (err: any) {
      setError(err.message || 'خطایی در ارسال پیام رخ داد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <textarea
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="پاسخ خود را اینجا بنویسید..."
          className="w-full bg-secondary border-2 border-transparent focus:border-primary focus:bg-card rounded-[2rem] px-8 py-8 text-sm font-black text-foreground transition-all outline-none resize-none"
        ></textarea>
        {error && <p className="text-red-500 text-xs font-bold mr-4">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="w-full h-18 rounded-2xl bg-foreground text-background font-black text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:pointer-events-none"
      >
        {isSubmitting ? (
          <span className="h-6 w-6 border-4 border-background border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <>
            <span>ارسال پاسخ</span>
            <span className="group-hover:translate-x-[-4px] transition-transform text-2xl">⚡</span>
          </>
        )}
      </button>
    </form>
  );
}
