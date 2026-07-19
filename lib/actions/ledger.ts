'use server';

import { prisma } from '../prisma';
import {
  LedgerAccount,
  LedgerTransaction,
  LedgerStats,
  LedgerAccountStatus,
  LedgerTransactionType,
  LedgerPaymentMethod,
  LedgerReminderStatus,
  LedgerReminderRepeat
} from '../types';
import { revalidatePath } from 'next/cache';
import { toEnglishDigits } from '../utils';

/**
 * Helper to convert Prisma Decimal to Number
 */
function decimalToNumber(d: any): number {
  return d ? Number(d.toString()) : 0;
}

/**
 * Helper to normalize phone numbers
 */
function normalizePhone(phone?: string): string {
  if (!phone) return '';
  let p = toEnglishDigits(phone).replace(/[^0-9]/g, '');
  if (p.startsWith('0')) p = p.substring(1);
  if (p.startsWith('98')) p = p.substring(2);
  return '0' + p;
}

/**
 * Get Ledger Statistics
 */
export async function getLedgerStatsAction(): Promise<{ success: boolean; data?: LedgerStats; error?: string }> {
  try {
    const accounts = await prisma.ledgerAccount.findMany({
      where: { status: { not: 'ARCHIVED' } }
    });

    let totalDebtors = 0;
    let totalCreditors = 0;
    let openCount = 0;
    let settledCount = 0;

    accounts.forEach(acc => {
      const bal = decimalToNumber(acc.balance);
      if (bal > 0) totalDebtors += bal;
      else if (bal < 0) totalCreditors += Math.abs(bal);

      if (acc.status === 'OPEN') openCount++;
      else if (acc.status === 'SETTLED') settledCount++;
    });

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const todayReminders = await prisma.ledgerReminder.count({
      where: {
        status: 'PENDING',
        dueDate: { gte: todayStart, lte: todayEnd }
      }
    });

    const overdueReminders = await prisma.ledgerReminder.count({
      where: {
        status: 'PENDING',
        dueDate: { lt: todayStart }
      }
    });

    return {
      success: true,
      data: {
        totalDebtorsAmount: totalDebtors,
        totalCreditorsAmount: totalCreditors,
        openAccountsCount: openCount,
        settledAccountsCount: settledCount,
        todayRemindersCount: todayReminders,
        overdueRemindersCount: overdueReminders
      }
    };
  } catch (e) {
    console.error('getLedgerStats Error:', e);
    return { success: false, error: 'خطا در دریافت آمار دفترچه' };
  }
}

/**
 * List Ledger Accounts
 */
export async function getLedgerAccountsAction(filters?: {
  search?: string;
  status?: LedgerAccountStatus;
  type?: 'DEBTOR' | 'CREDITOR' | 'SETTLED';
}) {
  try {
    const where: any = {};

    if (filters?.search) {
      const normalizedSearch = toEnglishDigits(filters.search);
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: normalizedSearch } },
        { title: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.type) {
      if (filters.type === 'DEBTOR') where.balance = { gt: 0 };
      else if (filters.type === 'CREDITOR') where.balance = { lt: 0 };
      else if (filters.type === 'SETTLED') where.balance = 0;
    }

    const accounts = await prisma.ledgerAccount.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });

    const formatted = accounts.map(acc => ({
      ...acc,
      balance: decimalToNumber(acc.balance),
      createdAt: acc.createdAt.toISOString(),
      updatedAt: acc.updatedAt.toISOString(),
    }));

    return { success: true, data: formatted };
  } catch (e) {
    console.error('getLedgerAccounts Error:', e);
    return { success: false, error: 'خطا در دریافت لیست حساب‌ها' };
  }
}

/**
 * Get Ledger Account Details
 */
export async function getLedgerAccountByIdAction(id: string) {
  try {
    const account = await prisma.ledgerAccount.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
          include: { items: true }
        },
        reminders: {
          where: { status: 'PENDING' },
          orderBy: { dueDate: 'asc' }
        }
      }
    });

    if (!account) return { success: false, error: 'حساب پیدا نشد' };

    const formatted = {
      ...account,
      balance: decimalToNumber(account.balance),
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
      transactions: account.transactions.map(t => ({
        ...t,
        amount: decimalToNumber(t.amount),
        balanceBefore: decimalToNumber(t.balanceBefore),
        balanceAfter: decimalToNumber(t.balanceAfter),
        transactionDate: t.transactionDate.toISOString(),
        createdAt: t.createdAt.toISOString(),
        items: t.items.map(item => ({
          ...item,
          quantity: decimalToNumber(item.quantity),
          unitPrice: decimalToNumber(item.unitPrice),
          totalPrice: decimalToNumber(item.totalPrice)
        }))
      })),
      reminders: account.reminders.map(r => ({
        ...r,
        dueDate: r.dueDate.toISOString(),
        createdAt: r.createdAt.toISOString()
      }))
    };

    return { success: true, data: formatted };
  } catch (e) {
    console.error('getLedgerAccountById Error:', e);
    return { success: false, error: 'خطا در دریافت جزئیات حساب' };
  }
}

/**
 * Create New Ledger Account
 */
export async function createLedgerAccountAction(data: {
  firstName: string;
  lastName: string;
  phone?: string;
  title?: string;
  description?: string;
  initialBalance?: number;
  direction?: 'DEBTOR' | 'CREDITOR';
  subject?: string; // بابت / عنوان بدهی اولیه
}) {
  try {
    const normalizedPhone = data.phone ? normalizePhone(data.phone) : undefined;

    // Check for duplicate phone
    if (normalizedPhone) {
      const existing = await prisma.ledgerAccount.findFirst({
        where: { phone: normalizedPhone }
      });
      if (existing) {
        return { success: false, error: `حسابی با شماره ${normalizedPhone} قبلاً ثبت شده است.` };
      }
    }

    const initialAmount = data.initialBalance || 0;
    const balance = data.direction === 'CREDITOR' ? -initialAmount : initialAmount;

    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.ledgerAccount.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: normalizedPhone,
          title: data.title,
          description: data.description,
          balance: balance,
          status: balance === 0 ? 'SETTLED' : 'OPEN'
        }
      });

      if (initialAmount !== 0 || data.subject) {
        await tx.ledgerTransaction.create({
          data: {
            accountId: account.id,
            type: 'INITIAL_BALANCE',
            amount: initialAmount,
            balanceBefore: 0,
            balanceAfter: balance,
            subject: data.subject || 'مانده اولیه هنگام ایجاد حساب',
            description: data.description,
            transactionDate: new Date()
          }
        });
      }

      await tx.ledgerAuditLog.create({
        data: {
          accountId: account.id,
          action: 'CREATE_ACCOUNT',
          details: { data }
        }
      });

      return account;
    });

    revalidatePath('/admin/ledger');
    return { success: true, data: result.id };
  } catch (e) {
    console.error('createLedgerAccount Error:', e);
    return { success: false, error: 'خطا در ایجاد حساب جدید' };
  }
}

/**
 * Add Transaction to Account
 */
export async function addLedgerTransactionAction(data: {
  accountId: string;
  type: LedgerTransactionType;
  amount: number;
  subject?: string;
  description?: string;
  transactionDate?: string;
  paymentMethod?: LedgerPaymentMethod;
  refNumber?: string;
  items?: { title: string; quantity: number; unitPrice: number }[];
  reminderDate?: string;
}) {
  try {
    const accountId = data.accountId;
    const amount = Number(data.amount);

    if (amount <= 0 && data.type !== 'ADJUSTMENT_NEGATIVE' && data.type !== 'ADJUSTMENT_POSITIVE') {
      return { success: false, error: 'مبلغ باید بیشتر از صفر باشد' };
    }

    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.ledgerAccount.findUnique({
        where: { id: accountId }
      });

      if (!account) throw new Error('Account not found');

      const balanceBefore = decimalToNumber(account.balance);
      let balanceAfter = balanceBefore;

      // Determine effect on balance
      // Positive balance means customer owes us (Debtor)
      // Negative balance means we owe customer (Creditor)
      switch (data.type) {
        case 'DEBT_INCREASE':
        case 'ADJUSTMENT_POSITIVE':
          balanceAfter += amount;
          break;
        case 'PAYMENT_RECEIVED':
        case 'DISCOUNT':
        case 'RETURNED_GOODS':
        case 'ADJUSTMENT_NEGATIVE':
        case 'DEBT_DECREASE': // We now owe them or reduced their debt
          balanceAfter -= amount;
          break;
        case 'PAYMENT_PAID': // We paid our debt to them
          balanceAfter += amount;
          break;
        default:
          break;
      }

      const transaction = await tx.ledgerTransaction.create({
        data: {
          accountId,
          type: data.type,
          amount,
          balanceBefore,
          balanceAfter,
          subject: data.subject,
          description: data.description,
          transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
          paymentMethod: data.paymentMethod,
          refNumber: data.refNumber,
          items: data.items ? {
            create: data.items.map(item => ({
              title: item.title,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice
            }))
          } : undefined
        }
      });

      await tx.ledgerAccount.update({
        where: { id: accountId },
        data: {
          balance: balanceAfter,
          status: balanceAfter === 0 ? 'SETTLED' : 'OPEN'
        }
      });

      if (data.reminderDate) {
        await tx.ledgerReminder.create({
          data: {
            accountId,
            dueDate: new Date(data.reminderDate),
            title: `یادآوری بابت: ${data.subject || 'تراکنش جدید'}`
          }
        });
      }

      await tx.ledgerAuditLog.create({
        data: {
          accountId,
          action: 'ADD_TRANSACTION',
          details: { transactionId: transaction.id, type: data.type, amount }
        }
      });

      return transaction;
    });

    revalidatePath(`/admin/ledger/${accountId}`);
    revalidatePath('/admin/ledger');

    return { success: true, data: result.id };
  } catch (e) {
    console.error('addLedgerTransaction Error:', e);
    return { success: false, error: 'خطا در ثبت تراکنش' };
  }
}

/**
 * Settlement Action
 */
export async function settleLedgerAccountAction(accountId: string, note?: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.ledgerAccount.findUnique({ where: { id: accountId } });
      if (!account) throw new Error('Account not found');

      const balance = decimalToNumber(account.balance);
      if (balance === 0) return { alreadySettled: true };

      const type: LedgerTransactionType = balance > 0 ? 'PAYMENT_RECEIVED' : 'PAYMENT_PAID';
      const amount = Math.abs(balance);

      await tx.ledgerTransaction.create({
        data: {
          accountId,
          type,
          amount,
          balanceBefore: balance,
          balanceAfter: 0,
          subject: 'تسویه کامل حساب',
          description: note,
          transactionDate: new Date()
        }
      });

      await tx.ledgerAccount.update({
        where: { id: accountId },
        data: { balance: 0, status: 'SETTLED' }
      });

      // Deactivate pending reminders
      await tx.ledgerReminder.updateMany({
        where: { accountId, status: 'PENDING' },
        data: { status: 'COMPLETED' }
      });

      await tx.ledgerAuditLog.create({
        data: {
          accountId,
          action: 'FULL_SETTLEMENT',
          details: { amount, note }
        }
      });

      return { success: true };
    });

    revalidatePath(`/admin/ledger/${accountId}`);
    revalidatePath('/admin/ledger');
    return { success: true };
  } catch (e) {
    console.error('settleLedgerAccount Error:', e);
    return { success: false, error: 'خطا در تسویه حساب' };
  }
}

/**
 * Archive/Delete Account
 */
export async function updateAccountStatusAction(id: string, status: LedgerAccountStatus) {
  try {
    await prisma.ledgerAccount.update({
      where: { id },
      data: { status }
    });
    revalidatePath('/admin/ledger');
    return { success: true };
  } catch (e) {
    return { success: false, error: 'خطا در تغییر وضعیت حساب' };
  }
}
