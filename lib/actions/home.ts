'use server';

import { getLocalHomeSlides, addLocalHomeSlide, updateLocalHomeSlide, deleteLocalHomeSlide } from '../db';
import { HomeSlide } from '../types';
import { revalidatePath } from 'next/cache';
import { uploadSystemImage, deleteS3Object } from '../upload-image';

export async function getHomeSlidesAction(onlyActive = false) {
  try {
    const data = await getLocalHomeSlides(onlyActive);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت اسلایدرها' };
  }
}

export async function createHomeSlideAction(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const link = formData.get('link') as string;
    const ctaText = formData.get('ctaText') as string;
    const priority = Number(formData.get('priority')) || 0;
    const isActive = formData.get('isActive') === 'true';

    const imageFile = formData.get('image') as File;
    const mobileImageFile = formData.get('mobileImage') as File;

    if (!imageFile || imageFile.size === 0) {
      return { success: false, error: 'تصویر دسکتاپ الزامی است' };
    }

    const image = await uploadSystemImage('slider', imageFile);
    let mobileImage = null;
    if (mobileImageFile && mobileImageFile.size > 0) {
      mobileImage = await uploadSystemImage('slider', mobileImageFile);
    }

    const slide = await addLocalHomeSlide({
      title,
      subtitle,
      image,
      mobileImage,
      link,
      ctaText,
      priority,
      isActive
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, data: slide };
  } catch (error: any) {
    console.error('Create Home Slide Error:', error);
    return { success: false, error: 'خطا در ایجاد اسلاید' };
  }
}

export async function updateHomeSlideAction(id: string, formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const link = formData.get('link') as string;
    const ctaText = formData.get('ctaText') as string;
    const priority = Number(formData.get('priority')) || 0;
    const isActive = formData.get('isActive') === 'true';

    const imageFile = formData.get('image') as File;
    const mobileImageFile = formData.get('mobileImage') as File;
    const existingImageUrl = formData.get('existingImageUrl') as string;
    const existingMobileImageUrl = formData.get('existingMobileImageUrl') as string;

    const updateData: Partial<HomeSlide> = {
      title,
      subtitle,
      link,
      ctaText,
      priority,
      isActive
    };

    if (imageFile && imageFile.size > 0) {
      if (existingImageUrl) await deleteS3Object(existingImageUrl);
      updateData.image = await uploadSystemImage('slider', imageFile);
    }

    if (mobileImageFile && mobileImageFile.size > 0) {
      if (existingMobileImageUrl) await deleteS3Object(existingMobileImageUrl);
      updateData.mobileImage = await uploadSystemImage('slider', mobileImageFile);
    } else if (formData.get('removeMobileImage') === 'true') {
      if (existingMobileImageUrl) await deleteS3Object(existingMobileImageUrl);
      updateData.mobileImage = null;
    }

    const slide = await updateLocalHomeSlide(id, updateData);

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, data: slide };
  } catch (error: any) {
    console.error('Update Home Slide Error:', error);
    return { success: false, error: 'خطا در بروزرسانی اسلاید' };
  }
}

export async function deleteHomeSlideAction(id: string, imageUrl: string, mobileImageUrl?: string | null) {
  try {
    await deleteLocalHomeSlide(id);
    if (imageUrl) await deleteS3Object(imageUrl);
    if (mobileImageUrl) await deleteS3Object(mobileImageUrl);

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در حذف اسلاید' };
  }
}

export async function toggleHomeSlideAction(id: string, isActive: boolean) {
  try {
    await updateLocalHomeSlide(id, { isActive });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در تغییر وضعیت اسلاید' };
  }
}
