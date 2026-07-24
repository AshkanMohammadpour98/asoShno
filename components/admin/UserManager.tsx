"use client";

import React, { useEffect, useState } from 'react';
import { getAllUsers, getUserDetails, updateUserRole } from '@/lib/actions/users';
import { formatJalaliDate } from '@/lib/utils';
import { Role } from '@prisma/client';
import Image from 'next/image';

export default function UserManager({
  onShowUserTickets,
  onShowTicket
}: {
  onShowUserTickets: (userId: string) => void;
  onShowTicket: (userId: string, ticketId: string) => void;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [filters, setFilters] = useState<{ search: string; role?: Role; page: number }>({
    search: '',
    page: 1
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers(filters);
      if (res.success) {
        setUsers(res.data || []);
        setPagination(res.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleSelectUser = async (id: string) => {
    setSelectedUserId(id);
    setDetailsLoading(true);
    try {
      const res = await getUserDetails(id);
      if (res.success) {
        setUserDetails(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRoleChange = async (newRole: Role) => {
    if (!selectedUserId) return;
    if (!confirm(`آیا از تغییر نقش این کاربر به ${newRole === 'ADMIN' ? 'مدیر' : 'مشتری'} مطمئن هستید؟`)) return;

    try {
      const res = await updateUserRole(selectedUserId, newRole);
      if (res.success) {
        setUserDetails((prev: any) => ({ ...prev, role: newRole }));
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-auto lg:h-[calc(100vh-200px)]">
      {/* Users List */}
      <div className={`w-full lg:w-96 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden ${selectedUserId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-5 lg:p-6 border-b border-slate-50 dark:border-slate-800 space-y-4">
          <h3 className="text-lg lg:text-xl font-black text-slate-800 dark:text-white">مدیریت کاربران</h3>
          <div className="space-y-3">
             <div className="relative">
                <input
                  type="text"
                  placeholder="جستجوی نام یا شماره..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800 rounded-xl px-10 text-[11px] font-bold outline-none border border-transparent focus:border-indigo-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 text-xs">🔍</span>
             </div>
             <select
                value={filters.role || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value as Role || undefined, page: 1 }))}
                className="w-full h-10 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 text-[10px] font-black outline-none"
             >
                <option value="">همه نقش‌ها</option>
                <option value="ADMIN">مدیران</option>
                <option value="CUSTOMER">مشتریان</option>
             </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[70vh] lg:max-h-none">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-10 text-slate-400 text-[10px] font-bold">کاربری یافت نشد.</div>
          ) : (
            users.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user.id)}
                className={`w-full text-right p-4 rounded-2xl transition-all border ${
                  selectedUserId === user.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                   <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${selectedUserId === user.id ? 'bg-white/20' : 'bg-white dark:bg-slate-900 border border-border/50'}`}>
                      👤
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-black text-xs lg:text-sm truncate">{user.firstName} {user.lastName}</h4>
                      <p className={`text-[10px] font-bold opacity-60 dir-ltr text-right`}>{user.phone}</p>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      {user.role === 'ADMIN' && (
                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md ${selectedUserId === user.id ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-600'}`}>ادمین</span>
                      )}
                      {user.hasUnread && (
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="پیام خوانده نشده"></span>
                      )}
                   </div>
                </div>
              </button>
            ))
          )}
        </div>

        {pagination.totalPages > 1 && (
           <div className="p-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center gap-2">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                className="h-8 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-black disabled:opacity-30"
              >
                قبلی
              </button>
              <span className="text-[10px] font-black opacity-50">صفحه {filters.page} از {pagination.totalPages}</span>
              <button
                disabled={filters.page === pagination.totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                className="h-8 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-black disabled:opacity-30"
              >
                بعدی
              </button>
           </div>
        )}
      </div>

      {/* User Details */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px] lg:min-h-0 ${!selectedUserId ? 'hidden lg:flex' : 'flex'}`}>
        {!selectedUserId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
             <span className="text-5xl lg:text-6xl mb-4">👥</span>
             <p className="font-black text-[10px] lg:text-sm uppercase tracking-widest">یک کاربر را برای مشاهده انتخاب کنید</p>
          </div>
        ) : detailsLoading ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="h-8 w-8 lg:h-10 lg:w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : userDetails ? (
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            {/* Profile Header */}
            <div className="p-6 lg:p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
               <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
                  <div className="relative">
                    <button onClick={() => setSelectedUserId(null)} className="lg:hidden absolute -top-4 -right-4 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center text-lg z-10">→</button>
                    <div className="h-24 w-24 lg:h-32 lg:w-32 rounded-[2.5rem] bg-indigo-600 text-white flex items-center justify-center text-4xl lg:text-5xl shadow-2xl shadow-indigo-500/20">
                       👤
                    </div>
                  </div>
                  <div className="flex-1">
                     <h3 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white mb-2">{userDetails.firstName} {userDetails.lastName}</h3>
                     <p className="text-sm font-bold text-slate-400 mb-4 dir-ltr text-right md:text-right">{userDetails.phone}</p>
                     <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${userDetails.role === 'ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                           {userDetails.role === 'ADMIN' ? 'مدیر سیستم' : 'مشتری معمولی'}
                        </span>
                        <span className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                           عضویت: {formatJalaliDate(userDetails.createdAt)}
                        </span>
                     </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => onShowUserTickets(userDetails.id)}
                      className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all"
                    >
                      مشاهده گفتگوها 📨
                    </button>
                  </div>
               </div>
            </div>

            {/* User Stats & Management */}
            <div className="p-6 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Activity Stats */}
               <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-4 h-px bg-slate-300"></span> آمار فعالیت
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">تعداد تیکت‌ها</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{userDetails._count.tickets}</p>
                     </div>
                     <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">علاقه‌مندی‌ها</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{userDetails._count.wishlists}</p>
                     </div>
                  </div>
               </div>

               {/* Role Management */}
               <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-4 h-px bg-slate-300"></span> مدیریت سطح دسترسی
                  </h4>
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                     <p className="text-xs font-bold text-slate-500 mb-4">تغییر نقش کاربر در سیستم:</p>
                     <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleRoleChange('CUSTOMER')}
                          className={`h-11 rounded-xl font-black text-[10px] transition-all ${userDetails.role === 'CUSTOMER' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-100'}`}
                        >
                           مشتری
                        </button>
                        <button
                          onClick={() => handleRoleChange('ADMIN')}
                          className={`h-11 rounded-xl font-black text-[10px] transition-all ${userDetails.role === 'ADMIN' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 hover:bg-amber-50'}`}
                        >
                           مدیر
                        </button>
                     </div>
                  </div>
               </div>

               {/* Recent Tickets */}
               <div className="md:col-span-2 space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <span className="w-4 h-px bg-slate-300"></span> آخرین گفتگوها
                    </h4>
                    <button onClick={() => onShowUserTickets(userDetails.id)} className="text-[10px] font-black text-indigo-600 underline">مشاهده همه</button>
                  </div>

                  {userDetails.tickets.length === 0 ? (
                    <div className="p-10 text-center bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl text-slate-400 text-xs font-bold italic">
                       هیچ گفتگویی ثبت نشده است.
                    </div>
                  ) : (
                    <div className="space-y-3">
                       {userDetails.tickets.map((ticket: any) => (
                         <button
                            key={ticket.id}
                            onClick={() => onShowTicket(userDetails.id, ticket.id)}
                            className="w-full text-right p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between items-center group hover:border-indigo-500 transition-all shadow-sm"
                         >
                            <div className="flex-1">
                               <h5 className="font-black text-sm text-slate-700 dark:text-slate-200 mb-1">{ticket.subject}</h5>
                               <p className="text-[10px] text-slate-400 line-clamp-1">{ticket.messages[0]?.content}</p>
                            </div>
                            <div className="text-left">
                               <p className="text-[9px] font-bold text-slate-400 mb-1">{formatJalaliDate(ticket.createdAt)}</p>
                               <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                                 ticket.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-600' :
                                 ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                               }`}>
                                  {ticket.status === 'ANSWERED' ? 'پاسخ داده شده' : ticket.status === 'OPEN' ? 'در انتظار پاسخ' : 'بسته شده'}
                               </span>
                            </div>
                         </button>
                       ))}
                    </div>
                  )}
               </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
