import { prisma } from './prisma';
import {
  LocalProduct,
  LocalCategory,
  LocalBrand,
  LocalAttribute,
  SiteSettings,
  BlogPost,
  BlogCategory,
  Announcement
} from './types';
import { toEnglishDigits } from './utils';

/**
 * Helper to safely parse numbers from strings with Persian/Arabic digits
 */
function safeParseFloat(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  const str = toEnglishDigits(String(val)).replace(/[^0-9.]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Helper to safely map Prisma Product to LocalProduct
 */
function mapProductToLocal(p: any): LocalProduct {
  return {
    ...p,
    price: String(p.price || 0),
    purchasePrice: p.purchasePrice ? String(p.purchasePrice) : undefined,
    isFeatured: !!p.isFeatured,
    category_id: p.categoryId,
    brand_id: p.brandId,
    created_at: p.createdAt instanceof Date ? p.createdAt.toISOString() : new Date().toISOString(),
    updated_at: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : new Date().toISOString(),
    specs: p.specs as any || [],
    categories: p.category ? { name: p.category.name } : undefined,
    brands: p.brand ? { name: p.brand.name } : undefined,
    variants: (p.variants || []).map((v: any) => ({
      id: v.id,
      colorName: v.colorName,
      colorCode: v.colorCode || undefined,
      price: v.price ? String(v.price) : undefined,
      stock: v.stock || 0
    }))
  } as unknown as LocalProduct;
}

/**
 * Products CRUD
 */
export async function getLocalProducts(filters?: {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  try {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.category) {
      where.categoryId = filters.category;
    }

    if (filters?.brand) {
      where.brandId = filters.brand;
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        variants: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return products.map(mapProductToLocal);
  } catch (error: any) {
    console.error(`[DB] getLocalProducts Error: ${error.code || 'unknown'} - ${error.message}`);
    return [];
  }
}

export async function getFeaturedProducts(limit: number = 4) {
  try {
    // Single query to get featured first, then newest
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        variants: true
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    return products.map(mapProductToLocal);
  } catch (error: any) {
    console.error(`[DB] getFeaturedProducts Error: ${error.code || 'P1008'} - ${error.message}`);
    // If it's a timeout, we definitely want to return an empty array to prevent crash
    return [];
  }
}

export async function addLocalProduct(product: Omit<LocalProduct, 'id' | 'created_at'> & { id?: string }) {
  const variants = (product.variants || []).map(v => {
    const vData: any = {
      colorName: v.colorName,
      stock: Number(v.stock) || 0,
    };
    if (v.colorCode) vData.colorCode = v.colorCode;
    const vPrice = safeParseFloat(v.price);
    if (vPrice !== null) vData.price = vPrice;
    return vData;
  });

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  const newProduct = await prisma.product.create({
    data: {
      id: product.id || undefined,
      name: product.name,
      description: product.description || null,
      price: safeParseFloat(product.price) || 0,
      purchasePrice: safeParseFloat(product.purchasePrice),
      isFeatured: product.isFeatured || false,
      shippingType: product.shippingType || 'PAID',
      images: product.images || [],
      specs: product.specs ? (product.specs as any) : [],
      condition: product.condition || null,
      slug: product.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      category: product.category_id ? { connect: { id: product.category_id } } : undefined,
      brand: product.brand_id ? { connect: { id: product.brand_id } } : undefined,
      variants: {
        create: variants
      },
      stock: totalStock
    }
  });

  return {
    ...newProduct,
    price: String(newProduct.price),
    category_id: newProduct.categoryId,
    brand_id: newProduct.brandId,
    created_at: newProduct.createdAt.toISOString()
  } as unknown as LocalProduct;
}

export async function updateLocalProduct(id: string, product: Partial<LocalProduct>) {
  // First, delete existing variants for this product to replace them
  if (product.variants) {
    await prisma.productVariant.deleteMany({
      where: { productId: id }
    });
  }

  const updatedData: any = {};
  if (product.name) updatedData.name = product.name;
  if (product.description !== undefined) updatedData.description = product.description;

  if (product.price !== undefined) {
    const mainPrice = safeParseFloat(product.price);
    if (mainPrice !== null) updatedData.price = mainPrice;
  }

  if (product.purchasePrice !== undefined) {
    updatedData.purchasePrice = safeParseFloat(product.purchasePrice);
  }

  if (product.isFeatured !== undefined) {
    updatedData.isFeatured = product.isFeatured;
  }

  if (product.shippingType) updatedData.shippingType = product.shippingType;
  if (product.images) updatedData.images = product.images;
  if (product.specs) updatedData.specs = product.specs as any;
  if (product.condition !== undefined) updatedData.condition = product.condition;

  if (product.category_id !== undefined) {
    updatedData.category = product.category_id ? { connect: { id: product.category_id } } : { disconnect: true };
  }
  if (product.brand_id !== undefined) {
    updatedData.brand = product.brand_id ? { connect: { id: product.brand_id } } : { disconnect: true };
  }

  if (product.variants) {
    const variants = product.variants.map(v => {
      const vData: any = {
        colorName: v.colorName,
        stock: Number(v.stock) || 0,
      };
      if (v.colorCode) vData.colorCode = v.colorCode;
      const vPrice = safeParseFloat(v.price);
      if (vPrice !== null) vData.price = vPrice;
      return vData;
    });

    updatedData.variants = {
      create: variants
    };
    updatedData.stock = variants.reduce((sum, v) => sum + v.stock, 0);
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updatedData
  });

  return {
    ...updatedProduct,
    price: String(updatedProduct.price),
    category_id: updatedProduct.categoryId,
    brand_id: updatedProduct.brandId,
    updated_at: updatedProduct.updatedAt.toISOString()
  } as unknown as LocalProduct;
}

export async function deleteLocalProduct(id: string) {
  await prisma.product.delete({
    where: { id }
  });
}

/**
 * Categories CRUD
 */
export async function getLocalCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return categories.map((c: any) => ({ id: c.id, name: c.name })) as LocalCategory[];
  } catch (error: any) {
    console.error(`[DB] getLocalCategories Error: ${error.code || 'unknown'} - ${error.message}`);
    return [];
  }
}

export async function addLocalCategory(name: string) {
  const newCat = await prisma.category.create({
    data: {
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    }
  });
  return { id: newCat.id, name: newCat.name } as LocalCategory;
}

export async function updateLocalCategory(id: string, name: string) {
  await prisma.category.update({
    where: { id },
    data: { name }
  });
}

export async function deleteLocalCategory(id: string) {
  await prisma.category.delete({
    where: { id }
  });
}

/**
 * Brands CRUD
 */
export async function getLocalBrands() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return brands.map((b: any) => ({ id: b.id, name: b.name })) as LocalBrand[];
  } catch (error: any) {
    console.error(`[DB] getLocalBrands Error: ${error.code || 'unknown'} - ${error.message}`);
    return [];
  }
}

export async function addLocalBrand(name: string) {
  const newBrand = await prisma.brand.create({
    data: { name }
  });
  return { id: newBrand.id, name: newBrand.name } as LocalBrand;
}

export async function updateLocalBrand(id: string, name: string) {
  await prisma.brand.update({
    where: { id },
    data: { name }
  });
}

export async function deleteLocalBrand(id: string) {
  await prisma.brand.delete({
    where: { id }
  });
}

/**
 * Attributes CRUD (Dynamic Specs)
 */
export async function getLocalAttributes() {
  try {
    const attributes = await prisma.attribute.findMany({
      include: { category: true },
      orderBy: { createdAt: 'asc' }
    });

    return attributes.map((a: any) => ({
      id: a.id,
      name: a.name,
      category_id: a.categoryId
    })) as LocalAttribute[];
  } catch (error: any) {
    console.error(`[DB] getLocalAttributes Error: ${error.code || 'unknown'} - ${error.message}`);
    return [];
  }
}

export async function addLocalAttribute(name: string, category_id: string) {
  const newAttr = await prisma.attribute.create({
    data: {
      name,
      category: { connect: { id: category_id } }
    }
  });

  return {
    id: newAttr.id,
    name: newAttr.name,
    category_id: newAttr.categoryId
  } as LocalAttribute;
}

export async function deleteLocalAttribute(id: string) {
  await prisma.attribute.delete({
    where: { id }
  });
}

/**
 * Settings CRUD
 */
export async function getLocalSettings(): Promise<SiteSettings> {
  const defaultSettings: SiteSettings = {
    general: { siteName: "آسو شنو", siteTitle: "آسو شنو", siteDescription: "", siteKeywords: "" },
    contact: { phone: "", address: "", email: "", instagram: "", telegram: "", whatsapp: "" },
    home: {
      heroTitle: "دنیای لپ‌تاپ‌های حرفه‌ای در آسو شنو",
      heroSubtitle: "واردات مستقیم از دبی",
      heroButtonText: "مشاهده محصولات",
      heroButtonLink: "/shop",
      heroImage: "hero/maniHeroCart/HeroImageJul (1).png",
      banners: [],
      servicesTitle: "چرا آسو شنو؟",
      servicesSubtitle: "تمایز ما در اصالت کالا و تخصص ۲۵ ساله ما در بازار تکنولوژی اشنویه و خاورمیانه است.",
      services: [
        {
          title: "واردات مستقیم از دبی",
          description: "حذف واسطه‌ها و ارائه بهترین قیمت برای لپ‌تاپ‌های گرید A++.",
          icon: "🇦🇪",
          image: "hero/DirectImport/imglap-1 (1).png",
          className: "md:col-span-2 md:row-span-2 bg-primary text-primary-foreground border-none shadow-primary/10",
          badge: "تخصص ما"
        },
        {
          title: "تعمیرات فوق تخصصی",
          description: "عیب‌یابی و تعمیر مادربرد و گرافیک با ۲۵ سال سابقه فنی.",
          icon: "🔬",
          className: "md:col-span-1 md:row-span-1 bg-card border-border text-foreground",
        },
        {
          title: "ارتقا سریع سیستم",
          description: "نصب SSD و RAM اورجینال در کمتر از ۳۰ دقیقه.",
          icon: "⚡",
          className: "md:col-span-1 md:row-span-1 bg-card border-border text-foreground",
        },
        {
          title: "ارسال به سراسر ایران",
          description: "ارسال ایمن با تیپاکس به تمام نقاط کشور در کمترین زمان.",
          icon: "📦",
          image: "hero/forwarding/imglap-2.png",
          className: "md:col-span-2 md:row-span-1 bg-secondary text-secondary-foreground border-border shadow-sm",
        },
      ],
      repairTitle: "روند تعمیرات",
      repairSubtitle: "سریع، شفاف و قابل اعتماد با ۲۵ سال سابقه تخصصی در اشنویه",
      repairSteps: [
        { title: "ثبت درخواست", description: "اطلاعات دستگاه و مشکل آن را به صورت آنلاین ثبت کنید.", icon: "📝" },
        { title: "تحویل دستگاه", description: "دستگاه را حضوری یا با پیک به ما برسانید.", icon: "📦" },
        { title: "عیب‌یابی تخصصی", description: "کارشناسان ما مشکل را بررسی و هزینه را اعلام می‌کنند.", icon: "🔍" },
        { title: "تعمیر و تست", description: "تعمیر تخصصی انجام شده و دستگاه کاملاً تست می‌شود.", icon: "🛠️" },
        { title: "تحویل نهایی", description: "دستگاه صحیح و سالم با گارانتی تعمیر تحویل داده می‌شود.", icon: "✅" },
      ],
      ctaTitle: "همین حالا مشاوره بگیرید",
      ctaSubtitle: "تیم متخصص آسو شنو در اشنویه آماده پاسخگویی به تمامی سوالات فنی شما در زمینه خرید یا تعمیرات تخصصی است.",
      ctaButtonText: "تماس با کارشناسان",
      ctaButtonLink: "/contact"
    },
    footer: { aboutText: "", copyright: "تمامی حقوق برای آسو شنو محفوظ است." },
    pages: { aboutUs: "", contactUs: "", rules: "", buyingGuide: "" },
    features: { shipping: "ارسال سریع", warranty: "ضمانت اصالت", payment: "پرداخت امن", support: "پشتیبانی ۲۴ ساعته" }
  };

  try {
    const record = await prisma.siteSettings.findUnique({
      where: { id: 'main' }
    });

    if (!record) return defaultSettings;

    const s = record.settings as any;

    return {
      general: {
        siteName: record.siteName || s?.general?.siteName || defaultSettings.general.siteName,
        logo: record.logo || s?.general?.logo || defaultSettings.general.logo,
        pwaLogo: s?.general?.pwaLogo || defaultSettings.general.pwaLogo,
        favicon: s?.general?.favicon || defaultSettings.general.favicon,
        siteTitle: s?.general?.siteTitle || record.siteName || defaultSettings.general.siteTitle,
        siteDescription: s?.general?.siteDescription || defaultSettings.general.siteDescription,
        siteKeywords: s?.general?.siteKeywords || defaultSettings.general.siteKeywords
      },
      contact: {
        email: record.contactEmail || s?.contact?.email || defaultSettings.contact.email,
        phone: record.phoneNumber || s?.contact?.phone || defaultSettings.contact.phone,
        address: s?.contact?.address || defaultSettings.contact.address,
        instagram: s?.contact?.instagram || defaultSettings.contact.instagram,
        telegram: s?.contact?.telegram || defaultSettings.contact.telegram,
        whatsapp: s?.contact?.whatsapp || defaultSettings.contact.whatsapp
      },
      home: {
        heroTitle: s?.home?.heroTitle || defaultSettings.home.heroTitle,
        heroSubtitle: s?.home?.heroSubtitle || defaultSettings.home.heroSubtitle,
        heroButtonText: s?.home?.heroButtonText || defaultSettings.home.heroButtonText,
        heroButtonLink: s?.home?.heroButtonLink || defaultSettings.home.heroButtonLink,
        heroImage: s?.home?.heroImage || record.footerText /* legacy mapping if any */ || defaultSettings.home.heroImage,
        banners: s?.home?.banners || defaultSettings.home.banners,
        servicesTitle: s?.home?.servicesTitle || defaultSettings.home.servicesTitle,
        servicesSubtitle: s?.home?.servicesSubtitle || defaultSettings.home.servicesSubtitle,
        services: s?.home?.services || defaultSettings.home.services,
        repairTitle: s?.home?.repairTitle || defaultSettings.home.repairTitle,
        repairSubtitle: s?.home?.repairSubtitle || defaultSettings.home.repairSubtitle,
        repairSteps: s?.home?.repairSteps || defaultSettings.home.repairSteps,
        ctaTitle: s?.home?.ctaTitle || defaultSettings.home.ctaTitle,
        ctaSubtitle: s?.home?.ctaSubtitle || defaultSettings.home.ctaSubtitle,
        ctaButtonText: s?.home?.ctaButtonText || defaultSettings.home.ctaButtonText,
        ctaButtonLink: s?.home?.ctaButtonLink || defaultSettings.home.ctaButtonLink
      },
      footer: {
        aboutText: record.footerText || s?.footer?.aboutText || defaultSettings.footer.aboutText,
        copyright: s?.footer?.copyright || defaultSettings.footer.copyright
      },
      pages: s?.pages || defaultSettings.pages,
      features: s?.features || defaultSettings.features
    } as SiteSettings;
  } catch (error: any) {
    console.error(`[DB] getLocalSettings Error: ${error.code || 'unknown'} - ${error.message}`);
    return defaultSettings;
  }
}

export async function updateLocalSettings(settings: SiteSettings) {
  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {
      siteName: settings.general.siteName,
      logo: settings.general.logo,
      contactEmail: settings.contact.email,
      phoneNumber: settings.contact.phone,
      footerText: settings.footer.aboutText,
      settings: settings as any
    },
    create: {
      id: 'main',
      siteName: settings.general.siteName,
      logo: settings.general.logo,
      contactEmail: settings.contact.email,
      phoneNumber: settings.contact.phone,
      footerText: settings.footer.aboutText,
      settings: settings as any
    }
  });
}

/**
 * Blog Posts CRUD
 */
export async function getLocalBlogPosts(filters?: { search?: string; category?: string }) {
  try {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { excerpt: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.category) {
      where.category = { name: filters.category };
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });

    return posts.map((p: any) => ({
      ...p,
      category: p.category?.name || '',
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      tags: p.tags || []
    })) as unknown as BlogPost[];
  } catch (error: any) {
    console.error(`[DB] getLocalBlogPosts Error: ${error.code || 'unknown'} - ${error.message}`);
    return [];
  }
}

/**
 * Helper to fetch Blog Categories with fallback to Product Categories
 */
export async function getMergedBlogCategories() {
  try {
    const blogCats = await prisma.blogCategory.findMany();

    if (blogCats.length > 0) {
      return blogCats.map((c: any) => ({ id: c.id, name: c.name })) as BlogCategory[];
    }

    // Fallback to Product Categories
    const productCats = await prisma.category.findMany();
    return productCats.map((c: any) => ({ id: c.id, name: c.name })) as BlogCategory[];
  } catch (error: any) {
    console.error(`[DB] getMergedBlogCategories Error: ${error.code || 'unknown'} - ${error.message}`);
    return [];
  }
}

export async function addLocalBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) {
  let blogCatId: string | undefined;
  if (post.category) {
    const cat = await prisma.blogCategory.upsert({
      where: { slug: post.category.toLowerCase().replace(/\s+/g, '-') },
      update: { name: post.category },
      create: {
        name: post.category,
        slug: post.category.toLowerCase().replace(/\s+/g, '-')
      }
    });
    blogCatId = cat.id;
  }

  const newPost = await prisma.blogPost.create({
    data: {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      status: post.status || 'draft',
      isFeatured: post.isFeatured || false,
      tags: post.tags || [],
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      category: blogCatId ? { connect: { id: blogCatId } } : undefined
    }
  });

  return {
    ...newPost,
    category: post.category,
    createdAt: newPost.createdAt.toISOString(),
    updatedAt: newPost.updatedAt.toISOString()
  } as unknown as BlogPost;
}

export async function updateLocalBlogPost(id: string, post: Partial<BlogPost>) {
  let blogCatId: string | undefined;
  if (post.category) {
    const cat = await prisma.blogCategory.upsert({
      where: { slug: post.category.toLowerCase().replace(/\s+/g, '-') },
      update: { name: post.category },
      create: {
        name: post.category,
        slug: post.category.toLowerCase().replace(/\s+/g, '-')
      }
    });
    blogCatId = cat.id;
  }

  const updatedPost = await prisma.blogPost.update({
    where: { id },
    data: {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      status: post.status,
      isFeatured: post.isFeatured,
      tags: post.tags,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      category: blogCatId ? { connect: { id: blogCatId } } : undefined
    }
  });

  return {
    ...updatedPost,
    category: post.category,
    createdAt: updatedPost.createdAt.toISOString(),
    updatedAt: updatedPost.updatedAt.toISOString()
  } as unknown as BlogPost;
}

export async function deleteLocalBlogPost(id: string) {
  await prisma.blogPost.delete({
    where: { id }
  });
}

/**
 * Blog Categories CRUD
 */
export async function getLocalBlogCategories() {
  try {
    const cats = await prisma.blogCategory.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return cats.map((c: any) => ({ id: c.id, name: c.name })) as BlogCategory[];
  } catch (error: any) {
    console.error(`[DB] getLocalBlogCategories Error: ${error.code || 'unknown'} - ${error.message}`);
    return [];
  }
}

export async function addLocalBlogCategory(name: string) {
  const newCat = await prisma.blogCategory.create({
    data: {
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    }
  });
  return { id: newCat.id, name: newCat.name } as BlogCategory;
}

export async function deleteLocalBlogCategory(id: string) {
  await prisma.blogCategory.delete({
    where: { id }
  });
}

/**
 * Announcements CRUD
 */
export async function getLocalAnnouncements(onlyActive = false) {
  try {
    const now = new Date();
    const where: any = {};

    if (onlyActive) {
      where.isActive = true;
      where.OR = [
        { startAt: null },
        { startAt: { lte: now } }
      ];
      where.AND = [
        {
          OR: [
            { endAt: null },
            { endAt: { gte: now } }
          ]
        }
      ];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return announcements.map((a: any) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      startAt: a.startAt?.toISOString(),
      endAt: a.endAt?.toISOString()
    })) as Announcement[];
  } catch (error: any) {
    console.error(`[DB] getLocalAnnouncements Error: ${error.code || 'unknown'} - ${error.message}`);
    return [];
  }
}

export async function addLocalAnnouncement(data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const newAnnouncement = await prisma.announcement.create({
    data: {
      id: data.id || undefined,
      title: data.title,
      message: data.message,
      type: data.type,
      displayMode: data.displayMode,
      imageUrl: data.imageUrl,
      isActive: data.isActive,
      startAt: data.startAt ? new Date(data.startAt) : null,
      endAt: data.endAt ? new Date(data.endAt) : null,
      dismissible: data.dismissible,
      priority: Number(data.priority) || 0,
      ctaText: data.ctaText,
      ctaUrl: data.ctaUrl
    }
  });

  return {
    ...newAnnouncement,
    createdAt: newAnnouncement.createdAt.toISOString(),
    updatedAt: newAnnouncement.updatedAt.toISOString(),
    startAt: newAnnouncement.startAt?.toISOString(),
    endAt: newAnnouncement.endAt?.toISOString()
  } as Announcement;
}

export async function updateLocalAnnouncement(id: string, data: Partial<Announcement>) {
  const updateData: any = { ...data };

  if (data.startAt !== undefined) updateData.startAt = data.startAt ? new Date(data.startAt) : null;
  if (data.endAt !== undefined) updateData.endAt = data.endAt ? new Date(data.endAt) : null;
  if (data.priority !== undefined) updateData.priority = Number(data.priority) || 0;

  // Remove fields that shouldn't be updated directly via this object if any
  delete updateData.id;
  delete updateData.createdAt;
  delete updateData.updatedAt;

  const updated = await prisma.announcement.update({
    where: { id },
    data: updateData
  });

  return {
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    startAt: updated.startAt?.toISOString(),
    endAt: updated.endAt?.toISOString()
  } as Announcement;
}

export async function deleteLocalAnnouncement(id: string) {
  await prisma.announcement.delete({
    where: { id }
  });
}
