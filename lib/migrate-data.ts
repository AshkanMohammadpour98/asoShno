import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const PUBLIC_URL = process.env.NEXT_PUBLIC_LIARA_URL || '';

function cleanImageUrl(url: string): string {
    if (!url) return '';
    // اگر آدرس کامل است، فقط Key را استخراج می‌کنیم
    if (url.startsWith(PUBLIC_URL)) {
        return url.replace(`${PUBLIC_URL}/`, '');
    }
    // اگر با /uploads شروع می‌شود (آدرس قدیمی محلی)
    if (url.startsWith('/uploads/')) {
        return url.replace('/', ''); // تبدیل به Key نسبی
    }
    return url;
}

async function migrate() {
  console.log('--- Starting Data Migration from JSON to PostgreSQL ---');

  if (!fs.existsSync(DB_PATH)) {
    console.error('Error: data/db.json not found!');
    return;
  }

  const rawData = fs.readFileSync(DB_PATH, 'utf-8');
  const db = JSON.parse(rawData);

  // 1. Migrate Categories
  console.log('Migrating Categories...');
  for (const cat of db.categories || []) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/\s+/g, '-') + '-' + cat.id
      }
    });
  }

  // 2. Migrate Brands
  console.log('Migrating Brands...');
  for (const brand of db.brands || []) {
    await prisma.brand.upsert({
      where: { id: brand.id },
      update: { name: brand.name },
      create: { id: brand.id, name: brand.name }
    });
  }

  // 3. Migrate Products
  console.log('Migrating Products...');
  for (const prod of db.products || []) {
    const catExists = db.categories?.some((c: any) => c.id === prod.category_id);
    const brandExists = db.brands?.some((b: any) => b.id === prod.brand_id);

    const images = (prod.images || []).map(cleanImageUrl);

    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.name,
        description: prod.description,
        price: parseFloat(prod.price) || 0,
        images: images,
        specs: prod.specs || [],
        condition: prod.condition || null,
        category: catExists ? { connect: { id: prod.category_id } } : undefined,
        brand: brandExists ? { connect: { id: prod.brand_id } } : undefined
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.name.toLowerCase().replace(/\s+/g, '-') + '-' + prod.id,
        description: prod.description,
        price: parseFloat(prod.price) || 0,
        images: images,
        specs: prod.specs || [],
        condition: prod.condition || null,
        createdAt: new Date(prod.created_at),
        category: catExists ? { connect: { id: prod.category_id } } : undefined,
        brand: brandExists ? { connect: { id: prod.brand_id } } : undefined
      }
    });
  }

  // 4. Migrate Blog Categories
  console.log('Migrating Blog Categories...');
  for (const bcat of db.blogCategories || []) {
    await prisma.blogCategory.upsert({
      where: { id: bcat.id },
      update: { name: bcat.name },
      create: {
        id: bcat.id,
        name: bcat.name,
        slug: bcat.name.toLowerCase().replace(/\s+/g, '-') + '-' + bcat.id
      }
    });
  }

  // 5. Migrate Blog Posts
  console.log('Migrating Blog Posts...');
  for (const post of db.blogPosts || []) {
    let blogCategoryId = null;
    if (post.category) {
        const cat = await prisma.blogCategory.findFirst({ where: { name: post.category } });
        blogCategoryId = cat?.id || null;
    }

    await prisma.blogPost.upsert({
      where: { id: post.id },
      update: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: cleanImageUrl(post.featuredImage),
        category: blogCategoryId ? { connect: { id: blogCategoryId } } : undefined
      },
      create: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: cleanImageUrl(post.featuredImage),
        createdAt: new Date(post.createdAt),
        category: blogCategoryId ? { connect: { id: blogCategoryId } } : undefined
      }
    });
  }

  // 6. Migrate Site Settings
  console.log('Migrating Site Settings...');
  if (db.settings) {
    const s = db.settings;
    await prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: {
        siteName: s.general?.siteName || 'Aso Shno',
        logo: cleanImageUrl(s.general?.logo),
        contactEmail: s.contact?.email,
        phoneNumber: s.contact?.phone,
        footerText: s.footer?.aboutText
      },
      create: {
        id: 'main',
        siteName: s.general?.siteName || 'Aso Shno',
        logo: cleanImageUrl(s.general?.logo),
        contactEmail: s.contact?.email,
        phoneNumber: s.contact?.phone,
        footerText: s.footer?.aboutText
      }
    });
  }

  console.log('--- Migration Completed Successfully! ---');
}

migrate()
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
