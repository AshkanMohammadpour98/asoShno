import { prisma } from './prisma';
import {
  LocalProduct,
  LocalCategory,
  LocalBrand,
  LocalAttribute,
  SiteSettings,
  BlogPost,
  BlogCategory
} from './types';

/**
 * Note: These functions are adapted to work with Prisma while maintaining
 * compatibility with existing UI calls.
 */

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
      category: true,
      brand: true,
      variants: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return products.map(p => ({
    ...p,
    price: String(p.price),
    purchasePrice: p.purchasePrice ? String(p.purchasePrice) : undefined,
    category_id: p.categoryId,
    brand_id: p.brandId,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
    specs: p.specs as any,
    categories: p.category ? { name: p.category.name } : undefined,
    brands: p.brand ? { name: p.brand.name } : undefined,
    variants: p.variants.map(v => ({
      id: v.id,
      colorName: v.colorName,
      colorCode: v.colorCode || undefined,
      stock: v.stock
    }))
  })) as unknown as LocalProduct[];
}

export async function addLocalProduct(product: Omit<LocalProduct, 'id' | 'created_at'>) {
  const newProduct = await prisma.product.create({
    data: {
      name: product.name,
      description: product.description,
      price: parseFloat(product.price) || 0,
      purchasePrice: product.purchasePrice ? parseFloat(product.purchasePrice) : undefined,
      shippingType: product.shippingType,
      images: product.images,
      specs: product.specs as any,
      condition: product.condition,
      slug: product.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      category: product.category_id ? { connect: { id: product.category_id } } : undefined,
      brand: product.brand_id ? { connect: { id: product.brand_id } } : undefined,
      variants: {
        create: product.variants?.map(v => ({
          colorName: v.colorName,
          colorCode: v.colorCode,
          stock: v.stock
        }))
      },
      stock: product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0
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

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      name: product.name,
      description: product.description,
      price: product.price ? parseFloat(product.price) : undefined,
      purchasePrice: product.purchasePrice ? parseFloat(product.purchasePrice) : undefined,
      shippingType: product.shippingType,
      images: product.images,
      specs: product.specs as any,
      condition: product.condition,
      category: product.category_id ? { connect: { id: product.category_id } } : undefined,
      brand: product.brand_id ? { connect: { id: product.brand_id } } : undefined,
      variants: product.variants ? {
        create: product.variants.map(v => ({
          colorName: v.colorName,
          colorCode: v.colorCode,
          stock: v.stock
        }))
      } : undefined,
      stock: product.variants ? product.variants.reduce((sum, v) => sum + v.stock, 0) : undefined
    }
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
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return categories.map(c => ({ id: c.id, name: c.name })) as LocalCategory[];
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
  const brands = await prisma.brand.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return brands.map(b => ({ id: b.id, name: b.name })) as LocalBrand[];
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
  const attributes = await prisma.attribute.findMany({
    include: { category: true },
    orderBy: { createdAt: 'asc' }
  });

  return attributes.map(a => ({
    id: a.id,
    name: a.name,
    category_id: a.categoryId
  })) as LocalAttribute[];
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
    home: { heroTitle: "دنیای لپ‌تاپ‌های حرفه‌ای در آسو شنو", heroSubtitle: "واردات مستقیم از دبی", heroButtonText: "مشاهده محصولات", heroButtonLink: "/shop", heroImage: "", banners: [] },
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
        banners: s?.home?.banners || defaultSettings.home.banners
      },
      footer: {
        aboutText: record.footerText || s?.footer?.aboutText || defaultSettings.footer.aboutText,
        copyright: s?.footer?.copyright || defaultSettings.footer.copyright
      },
      pages: s?.pages || defaultSettings.pages,
      features: s?.features || defaultSettings.features
    } as SiteSettings;
  } catch (error) {
    console.warn('Warning: Could not fetch site settings from DB during build. Using defaults.', error);
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

  // Fallback Logic: If no category is assigned, we could potentially map it differently
  // but for now we follow the requirement: use ProductCategory names as fallback if needed.
  // Actually, the requirement says: "اگر هیچ دسته‌بندی مخصوص مجله‌ای در ادمین تعریف نشده بود، سیستم بتواند به عنوان جایگزین از دسته‌بندی محصولات استفاده کند"
  // This usually means when DISPLAYING categories in a list/dropdown, not necessarily for individual posts.
  // I will implement a helper to fetch "Merged Categories" if needed.

  return posts.map(p => ({
    ...p,
    category: p.category?.name || '',
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    tags: p.tags || []
  })) as unknown as BlogPost[];
}

/**
 * Helper to fetch Blog Categories with fallback to Product Categories
 */
export async function getMergedBlogCategories() {
  const blogCats = await prisma.blogCategory.findMany();

  if (blogCats.length > 0) {
    return blogCats.map(c => ({ id: c.id, name: c.name })) as BlogCategory[];
  }

  // Fallback to Product Categories
  const productCats = await prisma.category.findMany();
  return productCats.map(c => ({ id: c.id, name: c.name })) as BlogCategory[];
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
  const cats = await prisma.blogCategory.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return cats.map(c => ({ id: c.id, name: c.name })) as BlogCategory[];
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
