'use server';

import {
  getLocalAnnouncements,
  addLocalAnnouncement,
  updateLocalAnnouncement,
  deleteLocalAnnouncement
} from '../db';
import { Announcement } from '../types';
import { uploadAnnouncementImage, deleteS3Object, getImageUrl, deleteAnnouncementImages } from '../upload-image';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function getAnnouncementsAction() {
  try {
    const data = await getLocalAnnouncements();

    // Inject image URLs
    const enhancedData = await Promise.all(data.map(async (item) => {
      if (item.imageUrl) {
        return { ...item, imageUrl: await getImageUrl(item.imageUrl) };
      }
      return item;
    }));

    return { success: true, data: enhancedData };
  } catch (e) {
    console.error('getAnnouncementsAction Error:', e);
    return { success: false, error: 'خطا در دریافت اعلان‌ها' };
  }
}

export async function getActiveAnnouncementsAction() {
  try {
    const data = await getLocalAnnouncements(true);

    const enhancedData = await Promise.all(data.map(async (item) => {
      if (item.imageUrl) {
        return { ...item, imageUrl: await getImageUrl(item.imageUrl) };
      }
      return item;
    }));

    return { success: true, data: enhancedData };
  } catch (e) {
    console.error('getActiveAnnouncementsAction Error:', e);
    return { success: false, error: 'خطا در دریافت اعلان‌های فعال' };
  }
}

export async function createAnnouncementAction(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;
    const type = formData.get('type') as any;
    const displayMode = formData.get('displayMode') as any;
    const isActive = formData.get('isActive') === 'true';
    const dismissible = formData.get('dismissible') === 'true';
    const priority = parseInt(formData.get('priority') as string) || 0;
    const startAt = formData.get('startAt') as string || undefined;
    const endAt = formData.get('endAt') as string || undefined;
    const ctaText = formData.get('ctaText') as string || undefined;
    const ctaUrl = formData.get('ctaUrl') as string || undefined;

    const imageFile = formData.get('image') as File | null;

    let imageUrl = '';

    // Generate ID beforehand to use as S3 folder name
    const announcementId = crypto.randomUUID();

    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadAnnouncementImage(announcementId, imageFile);
    }

    const newAnnouncement = await addLocalAnnouncement({
      id: announcementId,
      title,
      message,
      type,
      displayMode,
      imageUrl: imageUrl || undefined,
      isActive,
      dismissible,
      priority,
      startAt,
      endAt,
      ctaText,
      ctaUrl
    } as any);

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true, data: newAnnouncement };
  } catch (e) {
    console.error('createAnnouncementAction Error:', e);
    return { success: false, error: 'خطا در ایجاد اعلان' };
  }
}

export async function updateAnnouncementAction(id: string, formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;
    const type = formData.get('type') as any;
    const displayMode = formData.get('displayMode') as any;
    const isActive = formData.get('isActive') === 'true';
    const dismissible = formData.get('dismissible') === 'true';
    const priority = parseInt(formData.get('priority') as string) || 0;
    const startAt = formData.get('startAt') as string || undefined;
    const endAt = formData.get('endAt') as string || undefined;
    const ctaText = formData.get('ctaText') as string || undefined;
    const ctaUrl = formData.get('ctaUrl') as string || undefined;

    const imageFile = formData.get('image') as File | string | null;
    const existingImageUrl = formData.get('existingImageUrl') as string || '';

    let imageUrl = existingImageUrl;

    if (imageFile instanceof File && imageFile.size > 0) {
      // With fixed filename 'cover.webp', this will overwrite in S3
      imageUrl = await uploadAnnouncementImage(id, imageFile);
    } else if (formData.get('removeImage') === 'true') {
      await deleteAnnouncementImages(id);
      imageUrl = '';
    }

    const updated = await updateLocalAnnouncement(id, {
      title,
      message,
      type,
      displayMode,
      imageUrl: imageUrl || null as any,
      isActive,
      dismissible,
      priority,
      startAt,
      endAt,
      ctaText,
      ctaUrl
    } as any);

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true, data: updated };
  } catch (e) {
    console.error('updateAnnouncementAction Error:', e);
    return { success: false, error: 'خطا در بروزرسانی اعلان' };
  }
}

export async function deleteAnnouncementAction(id: string, imageUrl?: string) {
  try {
    // Clean up all images associated with this announcement
    await deleteAnnouncementImages(id);

    await deleteLocalAnnouncement(id);

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true };
  } catch (e) {
    console.error('deleteAnnouncementAction Error:', e);
    return { success: false, error: 'خطا در حذف اعلان' };
  }
}

export async function toggleAnnouncementAction(id: string, isActive: boolean) {
  try {
    await updateLocalAnnouncement(id, { isActive });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (e) {
    console.error('toggleAnnouncementAction Error:', e);
    return { success: false, error: 'خطا در تغییر وضعیت اعلان' };
  }
}
