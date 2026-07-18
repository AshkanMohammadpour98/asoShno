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
    heroImage: string;
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
