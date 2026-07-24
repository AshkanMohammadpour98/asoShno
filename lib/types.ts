export interface LocalCategory {
  id: string;
  name: string;
}

export interface LocalBrand {
  id: string;
  name: string;
}

export interface LocalAttribute {
  id: string;
  name: string;
  category_id: string;
}

export interface LocalProductVariant {
  id?: string;
  colorName: string;
  colorCode?: string;
  price?: string | number;
  stock: number;
}

export interface LocalProduct {
  id: string;
  name: string;
  description?: string;
  price: string;
  purchasePrice?: string; // مخصوص ادمین
  shippingType: 'FREE' | 'PAID';
  isFeatured?: boolean;
  category_id?: string;
  brand_id?: string;
  images: string[];
  created_at: string;
  updated_at?: string;
  specs?: { key: string, value: string }[];
  condition?: string;
  categories?: { name: string };
  brands?: { name: string };
  variants?: LocalProductVariant[];
  stock: number; // کل موجودی
}

export interface SiteSettings {
  general: {
    siteName: string;
    siteTitle: string;
    siteDescription: string;
    siteKeywords: string;
    logo?: string;
    pwaLogo?: string;
    favicon?: string;
  };
  contact: {
    phone: string;
    address: string;
    email: string;
    instagram: string;
    telegram: string;
    whatsapp: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    heroButtonText: string;
    heroButtonLink: string;
    heroLayout?: 'side-by-side' | 'stacked';
    banners: {
      title: string;
      link: string;
      image: string;
    }[];
    servicesTitle: string;
    servicesSubtitle: string;
    services: {
      title: string;
      description: string;
      icon: string;
      image?: string;
      badge?: string;
      className?: string;
    }[];
    repairTitle: string;
    repairSubtitle: string;
    repairSteps: {
      title: string;
      description: string;
      icon: string;
    }[];
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButtonText: string;
    ctaButtonLink: string;
  };
  footer: {
    aboutText: string;
    copyright: string;
  };
  pages: {
    aboutUs: string;
    contactUs: string;
    rules: string;
    buyingGuide: string;
  };
  features: {
    shipping: string;
    warranty: string;
    payment: string;
    support: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
  displayMode: 'SMALL' | 'LARGE';
  imageUrl?: string;
  isActive: boolean;
  startAt?: string;
  endAt?: string;
  dismissible: boolean;
  priority: number;
  ctaText?: string;
  ctaUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomeSlide {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  image: string;
  mobileImage?: string | null;
  link?: string | null;
  ctaText?: string | null;
  priority: number;
  isActive: boolean;
  textColor?: string | null;
  buttonColor?: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Ledger Types ---

export type LedgerAccountStatus = 'OPEN' | 'SETTLED' | 'ARCHIVED';
export type LedgerTransactionType =
  | 'DEBT_INCREASE'
  | 'DEBT_DECREASE'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_PAID'
  | 'DISCOUNT'
  | 'ADJUSTMENT_POSITIVE'
  | 'ADJUSTMENT_NEGATIVE'
  | 'RETURNED_GOODS'
  | 'INITIAL_BALANCE';

export type LedgerPaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'CHEQUE' | 'OTHER';
export type LedgerReminderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type LedgerReminderRepeat = 'NONE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface LedgerTransactionItem {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId?: string | null;
}

export interface LedgerTransaction {
  id: string;
  accountId: string;
  type: LedgerTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  subject?: string | null;
  description?: string | null;
  transactionDate: string;
  paymentMethod?: LedgerPaymentMethod | null;
  refNumber?: string | null;
  items: LedgerTransactionItem[];
  createdAt: string;
}

export interface LedgerReminder {
  id: string;
  accountId: string;
  title?: string | null;
  dueDate: string;
  status: LedgerReminderStatus;
  repeat: LedgerReminderRepeat;
  createdAt: string;
}

export interface LedgerAccount {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  title?: string | null;
  description?: string | null;
  status: LedgerAccountStatus;
  balance: number;
  transactions?: LedgerTransaction[];
  reminders?: LedgerReminder[];
  createdAt: string;
  updatedAt: string;
}

export interface LedgerStats {
  totalDebtorsAmount: number;
  totalCreditorsAmount: number;
  openAccountsCount: number;
  settledAccountsCount: number;
  todayRemindersCount: number;
  overdueRemindersCount: number;
}
