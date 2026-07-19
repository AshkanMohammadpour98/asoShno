'use client';

import React, { useState, useEffect } from 'react';
import {
  getLedgerStatsAction,
  getLedgerAccountsAction,
  getLedgerAccountByIdAction,
  createLedgerAccountAction,
  addLedgerTransactionAction,
  settleLedgerAccountAction,
  updateAccountStatusAction
} from '@/lib/actions/ledger';
import { LedgerAccount, LedgerTransaction, LedgerStats, LedgerAccountStatus, LedgerTransactionType, LedgerPaymentMethod } from '@/lib/types';
import { formatPrice, parsePrice, formatJalaliDate, formatJalaliShort } from '@/lib/utils';
import Image from 'next/image';

const LedgerManager = () => {
  const [activeSubTab, setActiveSubTab] = useState<'DEBTOR' | 'CREDITOR' | 'ALL'>('DEBTOR');
  const [stats, setStats] = useState<LedgerStats | null>(null);
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<LedgerAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Modals
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<LedgerTransactionType>('DEBT_INCREASE');

  // Dynamic Items for Transaction
  const [transactionItems, setTransactionItems] = useState<{title: string, quantity: number, unitPrice: number}[]>([]);
  const [showConfirmTransaction, setShowConfirmTransaction] = useState(false);
  const [tempTransactionData, setTempTransactionData] = useState<any>(null);

  const [transactionAmount, setTransactionTypeAmount] = useState('');

  // Filters
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const [statsRes, accountsRes] = await Promise.all([
      getLedgerStatsAction(),
      getLedgerAccountsAction({
        search,
        type: activeSubTab === 'ALL' ? undefined : activeSubTab
      })
    ]);

    if (statsRes.success) setStats(statsRes.data || null);
    if (accountsRes.success) setAccounts(accountsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab, search]);

  const handleSelectAccount = async (id: string) => {
    setLoading(true);
    const res = await getLedgerAccountByIdAction(id);
    if (res.success && res.data) {
      setSelectedAccount(res.data);
    }
    setLoading(false);
  };

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createLedgerAccountAction({
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      phone: formData.get('phone') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      initialBalance: Number(parsePrice(formData.get('initialBalance') as string || '0')),
      direction: formData.get('direction') as any,
      subject: formData.get('subject') as string // اضافه شدن بابت
    });

    if (res.success) {
      showNotify('حساب جدید با موفقیت ایجاد شد');
      setShowAddAccount(false);
      fetchData();
    } else {
      showNotify(res.error || 'خطا در ایجاد حساب', 'error');
    }
    setIsSubmitting(false);
  };

  const handleAddTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAccount) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    let totalAmount = Number(parsePrice(formData.get('amount') as string || '0'));

    // If items exist, use their sum if amount is zero
    if (transactionItems.length > 0 && totalAmount === 0) {
      totalAmount = transactionItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    const res = await addLedgerTransactionAction({
      accountId: selectedAccount.id,
      type: transactionType,
      amount: totalAmount,
      subject: formData.get('subject') as string,
      description: formData.get('description') as string,
      transactionDate: formData.get('transactionDate') as string,
      paymentMethod: formData.get('paymentMethod') as any,
      refNumber: formData.get('refNumber') as string,
      reminderDate: formData.get('reminderDate') as string,
      items: transactionItems.length > 0 ? transactionItems : undefined
    });

    if (res.success) {
      showNotify('تراکنش با موفقیت ثبت شد');
      setShowAddTransaction(false);
      setTransactionItems([]);
      handleSelectAccount(selectedAccount.id);
      fetchData();
    } else {
      showNotify(res.error || 'خطا در ثبت تراکنش', 'error');
    }
    setIsSubmitting(false);
  };

  const handleSettle = async () => {
    if (!selectedAccount || !confirm('آیا از تسویه کامل این حساب مطمئن هستید؟')) return;
    setIsSubmitting(true);
    const res = await settleLedgerAccountAction(selectedAccount.id);
    if (res.success) {
      showNotify('حساب با موفقیت تسویه شد');
      handleSelectAccount(selectedAccount.id);
      fetchData();
    } else {
      showNotify(res.error || 'خطا در تسویه حساب', 'error');
    }
    setIsSubmitting(false);
  };

  if (selectedAccount) {
    return (
      <div className="space-y-8 animate-fade-in relative pb-20 sm:pb-0">
        <button
          onClick={() => setSelectedAccount(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-black text-sm"
        >
          <span>←</span> بازگشت به لیست
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 sm:p-12 border-b border-slate-50 dark:border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-2xl">👤</div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      {selectedAccount.firstName} {selectedAccount.lastName}
                    </h2>
                    {selectedAccount.title && <p className="text-slate-400 font-bold text-sm italic">{selectedAccount.title}</p>}
                  </div>
                </div>
                <p className="text-slate-500 font-bold mr-16">{selectedAccount.phone || 'بدون شماره تماس'}</p>
              </div>

              <div className="text-left md:text-right space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">مانده فعلی حساب</p>
                <div className={`text-2xl sm:text-4xl font-black ${
                  selectedAccount.balance > 0 ? 'text-rose-600' :
                  selectedAccount.balance < 0 ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {formatPrice(Math.abs(selectedAccount.balance))} <span className="text-sm">تومان</span>
                </div>
                <p className={`text-xs font-black ${
                  selectedAccount.balance > 0 ? 'text-rose-500' :
                  selectedAccount.balance < 0 ? 'text-emerald-500' : 'text-slate-400'
                }`}>
                  {selectedAccount.balance > 0 ? 'او به ما بدهکار است' :
                   selectedAccount.balance < 0 ? 'ما به او بدهکاریم' : 'تسویه شده'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-800/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => { setTransactionType('DEBT_INCREASE'); setTransactionTypeAmount(''); setShowAddTransaction(true); }}
              className="h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2 font-black text-xs text-rose-600 hover:scale-105 transition-all"
            >
              <span>➕</span> افزایش بدهی
            </button>
            <button
              onClick={() => { setTransactionType('PAYMENT_RECEIVED'); setTransactionTypeAmount(''); setShowAddTransaction(true); }}
              className="h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2 font-black text-xs text-emerald-600 hover:scale-105 transition-all"
            >
              <span>💰</span> ثبت پرداخت
            </button>
            <button
              onClick={() => { setTransactionType('DISCOUNT'); setTransactionTypeAmount(''); setShowAddTransaction(true); }}
              className="h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2 font-black text-xs text-blue-600 hover:scale-105 transition-all"
            >
              <span>🎁</span> ثبت تخفیف
            </button>
            <button
              onClick={handleSettle}
              disabled={selectedAccount.balance === 0 || isSubmitting}
              className="h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2 font-black text-xs text-slate-600 hover:scale-105 transition-all disabled:opacity-50"
            >
              <span>✅</span> تسویه کامل
            </button>
          </div>

          <div className="p-8 sm:p-12 space-y-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                گردش حساب و تراکنش‌ها
              </h3>

              <div className="space-y-4">
                {selectedAccount.transactions?.map((t, idx) => (
                  <div key={t.id} className="group relative flex gap-6">
                    {idx !== (selectedAccount.transactions?.length || 0) - 1 && (
                      <div className="absolute top-8 bottom-0 right-4 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                    )}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center text-[10px] ${
                      t.type.includes('DEBT_INCREASE') || t.type.includes('POSITIVE') ? 'bg-rose-100 text-rose-600' :
                      t.type.includes('PAYMENT') || t.type.includes('DISCOUNT') ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.type.includes('DEBT') ? '🛒' : t.type.includes('PAYMENT') ? '💵' : '⚙️'}
                    </div>

                    <div className="flex-1 pb-8">
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatJalaliDate(t.transactionDate)}</span>
                            <h4 className="font-black text-slate-800 dark:text-white text-lg">{t.subject || 'تراکنش بدون عنوان'}</h4>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className={`text-xl font-black ${
                              t.type === 'DEBT_INCREASE' || t.type === 'ADJUSTMENT_POSITIVE' || t.type === 'PAYMENT_PAID' ? 'text-rose-600' : 'text-emerald-600'
                            }`}>
                              {t.type === 'DEBT_INCREASE' || t.type === 'ADJUSTMENT_POSITIVE' || t.type === 'PAYMENT_PAID' ? '➕' : '➖'}
                              {formatPrice(t.amount)} <span className="text-[10px]">تومان</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">
                              مانده: {formatPrice(t.balanceBefore)} ← {formatPrice(t.balanceAfter)}
                            </p>
                          </div>
                        </div>

                        {t.items && t.items.length > 0 && (
                          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-4 space-y-2">
                            {t.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-xs font-bold text-slate-500">
                                <span>{item.title} ({item.quantity} عدد)</span>
                                <span>{formatPrice(item.totalPrice)} تومان</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {t.description && (
                          <p className="mt-4 text-xs text-slate-500 leading-relaxed bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-50 dark:border-slate-800 italic">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {(!selectedAccount.transactions || selectedAccount.transactions.length === 0) && (
                  <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-slate-400 italic">
                    هیچ تراکنشی برای این حساب ثبت نشده است.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Buttons for Mobile */}
        <div className="fixed bottom-6 left-6 right-6 flex gap-3 sm:hidden z-50">
           <button onClick={() => { setTransactionType('DEBT_INCREASE'); setShowAddTransaction(true); }} className="flex-1 h-14 rounded-2xl bg-rose-600 text-white font-black shadow-xl shadow-rose-500/30">افزایش بدهی</button>
           <button onClick={() => { setTransactionType('PAYMENT_RECEIVED'); setShowAddTransaction(true); }} className="flex-1 h-14 rounded-2xl bg-emerald-600 text-white font-black shadow-xl shadow-emerald-500/30">ثبت پرداخت</button>
        </div>

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-vazir" dir="rtl">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddTransaction(false)}></div>
            <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-zoom-in border border-white/10">
              <form onSubmit={handleAddTransaction} className="p-8 sm:p-12 space-y-8">
                <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">ثبت عملیات جدید</h3>
                  <button type="button" onClick={() => setShowAddTransaction(false)} className="text-slate-400 hover:text-rose-500 transition-colors">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">نوع عملیات</label>
                    <select
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value as any)}
                      className="w-full h-12 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 font-black text-xs outline-none border-2 border-transparent focus:border-indigo-600"
                    >
                      <option value="DEBT_INCREASE">افزایش بدهی (خرید/قرض)</option>
                      <option value="PAYMENT_RECEIVED">دریافت وجه (پرداخت او)</option>
                      <option value="DISCOUNT">تخفیف / بخشودگی</option>
                      <option value="RETURNED_GOODS">برگشت کالا</option>
                      <option value="PAYMENT_PAID">پرداخت ما (بستانکار)</option>
                      <option value="ADJUSTMENT_POSITIVE">اصلاح حساب (مثبت)</option>
                      <option value="ADJUSTMENT_NEGATIVE">اصلاح حساب (منفی)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">مبلغ (تومان)</label>
                    <input
                      name="amount"
                      required
                      autoFocus
                      placeholder="0"
                      value={transactionAmount}
                      onChange={(e) => {
                        const val = parsePrice(e.target.value);
                        if (!isNaN(Number(val))) setTransactionTypeAmount(formatPrice(val));
                      }}
                      className="w-full h-12 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 font-black text-lg text-indigo-600 outline-none border-2 border-transparent focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">بابت / عنوان</label>
                  <input name="subject" required placeholder="مثلاً: خرید لپ‌تاپ لنوو" className="w-full h-12 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 font-black text-xs outline-none border-2 border-transparent focus:border-indigo-600" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تاریخ عملیات</label>
                    <input type="date" name="transactionDate" defaultValue={new Date().toISOString().slice(0,10)} className="w-full h-12 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 font-black text-xs outline-none border-2 border-transparent focus:border-indigo-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">یادآوری سررسید (اختیاری)</label>
                    <input type="date" name="reminderDate" className="w-full h-12 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 font-black text-xs outline-none border-2 border-transparent focus:border-indigo-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">توضیحات تکمیلی</label>
                  <textarea name="description" rows={3} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-bold text-xs outline-none border-2 border-transparent focus:border-indigo-600 resize-none"></textarea>
                </div>

                {/* Items Section */}
                <div className="border-t border-slate-50 dark:border-slate-800 pt-6">
                   <div className="flex justify-between items-center mb-4">
                      <p className="text-xs font-black text-slate-700 dark:text-slate-300">اقلام کالا یا خدمات (اختیاری)</p>
                      <button type="button" onClick={() => setTransactionItems([...transactionItems, {title: '', quantity: 1, unitPrice: 0}])} className="text-[10px] font-black text-indigo-600">+ افزودن ردیف</button>
                   </div>
                   <div className="space-y-3">
                      {transactionItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-end">
                           <div className="flex-[3] space-y-1">
                              <input placeholder="نام کالا" value={item.title} onChange={(e) => {
                                 const newItems = [...transactionItems];
                                 newItems[idx].title = e.target.value;
                                 setTransactionItems(newItems);
                              }} className="w-full h-10 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 text-[10px] font-bold outline-none border border-transparent focus:border-indigo-600" />
                           </div>
                           <div className="flex-1 space-y-1">
                              <input type="number" placeholder="تعداد" value={item.quantity} onChange={(e) => {
                                 const newItems = [...transactionItems];
                                 newItems[idx].quantity = Number(e.target.value);
                                 setTransactionItems(newItems);
                              }} className="w-full h-10 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 text-[10px] font-bold outline-none border border-transparent focus:border-indigo-600" />
                           </div>
                           <div className="flex-[2] space-y-1">
                              <input placeholder="قیمت واحد" value={formatPrice(item.unitPrice)} onChange={(e) => {
                                 const newItems = [...transactionItems];
                                 newItems[idx].unitPrice = Number(parsePrice(e.target.value));
                                 setTransactionItems(newItems);
                              }} className="w-full h-10 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 text-[10px] font-bold outline-none border border-transparent focus:border-indigo-600" />
                           </div>
                           <button type="button" onClick={() => setTransactionItems(transactionItems.filter((_, i) => i !== idx))} className="h-10 w-10 flex-shrink-0 bg-rose-50 text-rose-500 rounded-xl text-xs">✕</button>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Summary Info before Submit */}
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-6 rounded-3xl space-y-3">
                   <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>مانده قبلی:</span>
                      <span>{formatPrice(selectedAccount.balance)} تومان</span>
                   </div>
                   <div className="flex justify-between text-sm font-black text-indigo-600 border-t border-indigo-100 dark:border-indigo-900 pt-3">
                      <span>مانده پس از ثبت:</span>
                      <span>
                         {(() => {
                            const amount = Number(parsePrice(transactionAmount || '0'));
                            let current = selectedAccount.balance;
                            if (transactionType === 'DEBT_INCREASE' || transactionType === 'ADJUSTMENT_POSITIVE' || transactionType === 'PAYMENT_PAID') {
                               current += amount;
                            } else {
                               current -= amount;
                            }
                            return formatPrice(current);
                         })()} تومان
                      </span>
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddTransaction(false)} className="flex-1 h-14 rounded-2xl bg-slate-50 text-slate-500 font-black text-sm">انصراف</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] h-14 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-500/20">
                    {isSubmitting ? 'در حال ثبت...' : 'تأیید و ثبت نهایی'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in relative">
      {notification && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl animate-bounce-in flex items-center gap-4 border ${
          notification.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'
        }`}>
          <span className="font-black text-sm">{notification.message}</span>
        </div>
      )}

      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h3 className="text-2xl sm:text-3xl font-estedad text-slate-900 dark:text-white">دفترچه حساب ادمین</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">مدیریت بدهکاران، بستانکاران و تراکنش‌های نسیه</p>
        </div>
        <button
          onClick={() => setShowAddAccount(true)}
          className="w-full sm:w-auto h-14 sm:h-16 px-10 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl hover:scale-105 transition-all"
        >
          + ایجاد حساب جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-rose-600 text-white shadow-xl shadow-rose-500/20 space-y-2">
           <p className="text-[10px] font-black uppercase tracking-widest opacity-60">کل طلب ما از دیگران</p>
           <h4 className="text-2xl font-black">{formatPrice(stats?.totalDebtorsAmount)} <span className="text-xs">تومان</span></h4>
        </div>
        <div className="p-8 rounded-[2.5rem] bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 space-y-2">
           <p className="text-[10px] font-black uppercase tracking-widest opacity-60">کل بدهی ما به دیگران</p>
           <h4 className="text-2xl font-black">{formatPrice(stats?.totalCreditorsAmount)} <span className="text-xs">تومان</span></h4>
        </div>
        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">حساب‌های باز</p>
           <h4 className="text-2xl font-black text-slate-800 dark:text-white">{stats?.openAccountsCount} <span className="text-xs">مورد</span></h4>
        </div>
        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">سررسید امروز</p>
           <h4 className="text-2xl font-black text-orange-500">{stats?.todayRemindersCount} <span className="text-xs">مورد</span></h4>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('DEBTOR')}
            className={`flex-1 sm:px-8 py-3 rounded-xl font-black text-[11px] transition-all ${activeSubTab === 'DEBTOR' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            بدهکاران به ما
          </button>
          <button
            onClick={() => setActiveSubTab('CREDITOR')}
            className={`flex-1 sm:px-8 py-3 rounded-xl font-black text-[11px] transition-all ${activeSubTab === 'CREDITOR' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            بستانکاران (طلبکار)
          </button>
          <button
            onClick={() => setActiveSubTab('ALL')}
            className={`flex-1 sm:px-8 py-3 rounded-xl font-black text-[11px] transition-all ${activeSubTab === 'ALL' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            همه حساب‌ها
          </button>
        </div>

        <div className="flex-1 relative group">
          <input
            type="text"
            placeholder="جستجو نام یا شماره موبایل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 bg-white dark:bg-slate-900 rounded-2xl px-12 font-bold text-xs outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-600 transition-all shadow-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
        </div>
      </div>

      {/* Account List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : accounts.map(acc => (
          <div
            key={acc.id}
            onClick={() => handleSelectAccount(acc.id)}
            className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-1 h-full bg-slate-100 group-hover:bg-indigo-500 transition-colors"></div>

            <div className="flex justify-between items-start mb-6">
              <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl group-hover:bg-indigo-50 transition-colors">👤</div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                acc.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
              }`}>
                {acc.status === 'SETTLED' ? 'تسویه شده' : 'حساب باز'}
              </span>
            </div>

            <div className="space-y-1 mb-6">
              <h4 className="font-black text-lg text-slate-800 dark:text-white">{acc.firstName} {acc.lastName}</h4>
              <p className="text-[11px] font-bold text-slate-400">{acc.phone || 'بدون شماره'}</p>
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">مانده نهایی</p>
                <div className={`font-black ${acc.balance > 0 ? 'text-rose-600' : acc.balance < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {formatPrice(Math.abs(acc.balance))} <span className="text-[10px]">تومان</span>
                </div>
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">آخرین بروزرسانی</p>
                <span className="text-[10px] font-bold text-slate-500">{formatJalaliShort(acc.updatedAt)}</span>
              </div>
            </div>
          </div>
        ))}

        {!loading && accounts.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-slate-400 italic">
            حسابی مطابق با جستجو پیدا نشد.
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-vazir" dir="rtl">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddAccount(false)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative animate-zoom-in border border-white/10">
            <form onSubmit={handleAddAccount} className="p-8 sm:p-14 space-y-10">
              <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">ایجاد حساب جدید در دفترچه</h3>
                <button type="button" onClick={() => setShowAddAccount(false)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 mr-2">نام</label>
                  <input name="firstName" required className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black border-2 border-transparent focus:border-indigo-600 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 mr-2">نام خانوادگی</label>
                  <input name="lastName" required className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black border-2 border-transparent focus:border-indigo-600 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 mr-2">شماره موبایل</label>
                  <input name="phone" className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black border-2 border-transparent focus:border-indigo-600 outline-none" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 mr-2">عنوان یا لقب (اختیاری)</label>
                  <input name="title" className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 font-black border-2 border-transparent focus:border-indigo-600 outline-none" placeholder="مثلا: شرکت پارسیان" />
                </div>
              </div>

              <div className="p-8 bg-indigo-50 dark:bg-indigo-950/20 rounded-3xl space-y-6">
                <p className="text-xs font-black text-indigo-600">جزئیات بدهی/طلب اولیه (اختیاری):</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase mr-2 tracking-widest">بابت / علت حساب</label>
                    <input name="subject" placeholder="مثلاً: خرید لپ‌تاپ، نسیه، کارهای امانی..." className="w-full h-14 bg-white dark:bg-slate-900 rounded-2xl px-6 font-black text-xs border-2 border-transparent focus:border-indigo-600 outline-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase mr-2 tracking-widest">مبلغ اولیه (تومان)</label>
                      <input
                        name="initialBalance"
                        onChange={(e) => {
                          const val = parsePrice(e.target.value);
                          if (!isNaN(Number(val))) e.target.value = formatPrice(val);
                        }}
                        className="w-full h-14 bg-white dark:bg-slate-900 rounded-2xl px-6 font-black text-lg border-2 border-transparent focus:border-indigo-600 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase mr-2 tracking-widest">وضعیت اولیه</label>
                      <select name="direction" className="w-full h-14 bg-white dark:bg-slate-900 rounded-2xl px-6 font-black text-xs border-2 border-transparent focus:border-indigo-600 outline-none">
                        <option value="DEBTOR">او به ما بدهکار است</option>
                        <option value="CREDITOR">ما به او بدهکاریم (بستانکار)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowAddAccount(false)} className="h-14 px-10 rounded-2xl font-black text-slate-400">انصراف</button>
                <button type="submit" disabled={isSubmitting} className="h-14 px-16 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-500/20">
                  {isSubmitting ? 'در حال ایجاد...' : 'ایجاد حساب و ذخیره'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerManager;
