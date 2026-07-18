'use server';

import {
  getLocalProducts,
  addLocalProduct,
  updateLocalProduct,
  deleteLocalProduct,
  getLocalCategories,
  getLocalBrands,
  addLocalCategory,
  updateLocalCategory,
  deleteLocalCategory,
  addLocalBrand,
  updateLocalBrand,
  deleteLocalBrand,
  getLocalAttributes,
  addLocalAttribute,
  deleteLocalAttribute,
  getFeaturedProducts
} from '../db';
import { LocalProduct } from '../types';
import { uploadProductImage, deleteS3Object, deleteProductImages, getImageUrl } from '../upload-image';
import { revalidatePath } from 'next/cache';
import { prisma } from '../prisma';
import crypto from 'crypto';
import { toEnglishDigits } from '../utils';

export type ProductInput = {
  name: string;
  description?: string;
  price: string | number;
  purchasePrice?: string | number;
  shippingType: 'FREE' | 'PAID';
  isFeatured?: boolean;
  category_id?: string;
  brand_id?: string;
  main_image: File | string | null;
  gallery_images: (File | string | null)[];
  variants?: { colorName: string, colorCode?: string, price?: string | number, stock: number }[];

  // Dynamic specs
  specs?: { key: string, value: string }[];
  condition?: string;
};

/**
 * Products Actions
 */
export async function getFeaturedProductsAction() {
  try {
    const data = await getFeaturedProducts(4);
    const enhancedData = await Promise.all(data.map(async (product) => {
      const signedImages = await Promise.all(
        product.images.map(img => getImageUrl(img))
      );
      return { ...product, images: signedImages };
    }));
    return { success: true, data: enhancedData };
  } catch (e) {
    console.error('getFeaturedProductsAction Error:', e);
    return { success: false, error: 'خطا در دریافت محصولات پیشنهادی' };
  }
}
export async function getProducts(filters?: {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  try {
    const data = await getLocalProducts(filters);

    // تزریق آدرس‌های امضا شده (Signed URLs) قبل از ارسال به کلاینت
    const enhancedData = await Promise.all(data.map(async (product) => {
      const signedImages = await Promise.all(
        product.images.map(img => getImageUrl(img))
      );
      return { ...product, images: signedImages };
    }));

    return { success: true, data: enhancedData };
  } catch (e) {
    console.error('getProducts Error:', e);
    return { success: false, error: 'خطا در دریافت محصولات' };
  }
}

export async function getProductById(id: string) {
  try {
    const products = await getLocalProducts();
    const product = products.find(p => p.id === id);
    if (!product) return { success: false, error: 'محصول پیدا نشد.' };

    // تزریق آدرس‌های امضا شده برای محصول تکی
    const signedImages = await Promise.all(
      product.images.map(img => getImageUrl(img))
    );

    const enhancedProduct = { ...product, images: signedImages };

    return { success: true, data: enhancedProduct };
  } catch (error) {
    console.error('getProductById Error:', error);
    return { success: false, error: 'خطا در دریافت اطلاعات محصول.' };
  }
}

export async function getProductsByIds(ids: string[]) {
  try {
    const allProducts = await getLocalProducts();
    const filtered = allProducts.filter(p => ids.includes(p.id));

    const enhancedData = await Promise.all(filtered.map(async (product) => {
      const signedImages = await Promise.all(
        product.images.map(img => getImageUrl(img))
      );
      return { ...product, images: signedImages };
    }));

    return { success: true, data: enhancedData };
  } catch (error) {
    console.error('getProductsByIds Error:', error);
    return { success: false, error: 'خطا در دریافت محصولات.' };
  }
}

/**
 * Categories Actions
 */
export async function getCategories() {
  try {
    const data = await getLocalCategories();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: 'خطا' };
  }
}
export async function createCategory(name: string) {
  try {
    const data = await addLocalCategory(name);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: 'خطا' };
  }
}
export async function updateCategory(id: string, name: string) {
  try {
    await updateLocalCategory(id, name);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'خطا' };
  }
}
export async function deleteCategory(id: string) {
  try {
    await deleteLocalCategory(id);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'خطا' };
  }
}

/**
 * Brands Actions
 */
export async function getBrands() {
  try {
    const data = await getLocalBrands();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: 'خطا' };
  }
}
export async function createBrand(name: string) {
  try {
    const data = await addLocalBrand(name);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: 'خطا' };
  }
}
export async function updateBrand(id: string, name: string) {
  try {
    await updateLocalBrand(id, name);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'خطا' };
  }
}
export async function deleteBrand(id: string) {
  try {
    await deleteLocalBrand(id);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'خطا' };
  }
}

/**
 * Attributes Actions
 */
export async function getAttributes() {
  try {
    const data = await getLocalAttributes();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: 'خطا' };
  }
}
export async function createAttribute(name: string, categoryId: string) {
  try {
    const data = await addLocalAttribute(name, categoryId);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: 'خطا' };
  }
}
export async function deleteAttribute(id: string) {
  try {
    await deleteLocalAttribute(id);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'خطا' };
  }
}

/**
 * Handle Standardized Image Uploads for Products
 */
async function handleStandardizedImageUploads(productId: string, input: ProductInput, existingImages: string[] = []) {
  const imageKeys: string[] = [...existingImages];

  // ۱. آپلود تصویر اصلی
  if (input.main_image instanceof File) {
    console.log(`[Action] Uploading main image for product: ${productId}`);
    // اگر تصویر جدید است، تصویر قبلی را حذف می‌کنیم (اختیاری، بستگی به استراتژی شما دارد)
    if (imageKeys[0]) await deleteS3Object(imageKeys[0]);

    const key = await uploadProductImage(productId, input.main_image, true);
    imageKeys[0] = key;
  }

  // ۲. آپلود تصاویر گالری (۳ عدد)
  for (let i = 0; i < 3; i++) {
    const img = input.gallery_images[i];
    const index = i + 1;

    if (img instanceof File) {
      console.log(`[Action] Uploading gallery image ${index} for product: ${productId}`);
      if (imageKeys[index]) await deleteS3Object(imageKeys[index]);

      const key = await uploadProductImage(productId, img, false);
      imageKeys[index] = key;
    } else if (img === null && imageKeys[index]) {
        console.log(`[Action] Deleting gallery image ${index} for product: ${productId}`);
        // اگر کاربر تصویر را پاک کرده باشد
        await deleteS3Object(imageKeys[index]);
        imageKeys[index] = '';
    }
  }

  return imageKeys.filter(key => !!key);
}

/**
 * Product Persistence
 */
export async function createProduct(input: ProductInput) {
  try {
    const productId = crypto.randomUUID();
    console.log(`[Action] Starting create product with ID: ${productId}`);

    const imageKeys = await handleStandardizedImageUploads(productId, input);
    const cleanPrice = toEnglishDigits(String(input.price)).replace(/[^0-9.]/g, '');

    const newProduct = await addLocalProduct({
      id: productId, // استفاده از آیدی تولید شده برای دیتابیس
      name: input.name,
      description: input.description,
      price: cleanPrice,
      purchasePrice: input.purchasePrice ? String(input.purchasePrice) : undefined,
      isFeatured: input.isFeatured,
      shippingType: input.shippingType,
      category_id: input.category_id,
      brand_id: input.brand_id,
      images: imageKeys,
      specs: input.specs,
      condition: input.condition,
      variants: input.variants,
      stock: input.variants?.reduce((sum, v) => sum + v.stock, 0) || 0
    });

    console.log(`[Action] Product created successfully in DB: ${newProduct.id}`);
    if (imageKeys.length > 0) {
        console.log(`[Action] TEST THIS URL NOW: https://storage.c2.liara.site/${process.env.LIARA_BUCKET_NAME}/${imageKeys[0]}`);
    }

    revalidatePath('/admin');
    revalidatePath('/shop');
    return { success: true, data: newProduct };
  } catch (error: any) {
    console.error('Create Product Error:', error);
    return { success: false, error: error.message || 'خطا در ثبت محصول.' };
  }
}

export async function updateProduct(id: string, input: ProductInput) {
  try {
    console.log(`[Action] Starting update product: ${id}`);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error('محصول پیدا نشد.');

    const imageKeys = await handleStandardizedImageUploads(id, input, product.images);
    const cleanPrice = toEnglishDigits(String(input.price)).replace(/[^0-9.]/g, '');

    const updatedProduct = await updateLocalProduct(id, {
      name: input.name,
      description: input.description,
      price: cleanPrice,
      purchasePrice: input.purchasePrice ? String(input.purchasePrice) : undefined,
      isFeatured: input.isFeatured,
      shippingType: input.shippingType,
      category_id: input.category_id,
      brand_id: input.brand_id,
      images: imageKeys,
      specs: input.specs,
      condition: input.condition,
      variants: input.variants,
      stock: input.variants?.reduce((sum, v) => sum + v.stock, 0) || 0
    });

    console.log(`[Action] Product updated successfully: ${id}`);

    revalidatePath('/admin');
    revalidatePath('/shop');
    revalidatePath(`/shop/product/${id}`);
    return { success: true, data: updatedProduct };
  } catch (error: any) {
    console.error('Update Product Error:', error);
    return { success: false, error: error.message || 'خطا در ویرایش محصول.' };
  }
}

export async function deleteProduct(id: string) {
  try {
    console.log(`[ProductAction] Starting deletion for product: ${id}`);
    // ۱. حذف تمامی تصاویر محصول از S3
    await deleteProductImages(id);

    // ۲. حذف رکورد از دیتابیس
    await deleteLocalProduct(id);

    console.log(`[ProductAction] Successfully deleted product and images for: ${id}`);
    revalidatePath('/admin');
    revalidatePath('/shop');
    return { success: true };
  } catch (error: any) {
    console.error('Delete Product Error:', error);
    return { success: false, error: 'خطا در حذف محصول.' };
  }
}
