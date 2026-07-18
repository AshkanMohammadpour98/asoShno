'use server';

import { getLocalSettings, updateLocalSettings } from '../db';
import { SiteSettings } from '../types';
import { revalidatePath } from 'next/cache';
import { uploadSystemImage, deleteS3Object } from '../upload-image';
import { prisma } from '../prisma';

export async function getSiteSettings() {
  try {
    const data = await getLocalSettings();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت تنظیمات' };
  }
}

export async function updateSiteSettings(
  settings: SiteSettings,
  files?: {
    heroImage?: File,
    logo?: File,
    banners?: { index: number, file: File }[],
    services?: { index: number, file: File }[]
  }
) {
  try {
    const currentSettings = { ...settings };
    const existing = await prisma.siteSettings.findUnique({ where: { id: 'main' } });

    // Handle Hero Image Upload
    if (files?.heroImage) {
      if (existing?.settings && (existing.settings as any).home?.heroImage) {
          await deleteS3Object((existing.settings as any).home.heroImage);
      }
      const key = await uploadSystemImage('hero', files.heroImage);
      currentSettings.home.heroImage = key;
    }

    // Handle Logo Upload
    if (files?.logo) {
      if (existing?.logo) {
          await deleteS3Object(existing.logo);
      }
      const key = await uploadSystemImage('logo', files.logo);
      currentSettings.general.logo = key;
    }

    // Handle Banners Upload
    if (files?.banners) {
      for (const b of files.banners) {
        if (currentSettings.home.banners[b.index]?.image) {
            await deleteS3Object(currentSettings.home.banners[b.index].image);
        }
        const key = await uploadSystemImage('settings', b.file);
        if (currentSettings.home.banners[b.index]) {
          currentSettings.home.banners[b.index].image = key;
        }
      }
    }

    // Handle Services Images Upload
    if (files?.services) {
      for (const s of files.services) {
        if (currentSettings.home.services[s.index]?.image) {
          await deleteS3Object(currentSettings.home.services[s.index].image);
        }
        const key = await uploadSystemImage('hero', s.file);
        if (currentSettings.home.services[s.index]) {
          currentSettings.home.services[s.index].image = key;
        }
      }
    }

    await updateLocalSettings(currentSettings);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Update Site Settings Error:', error);
    return { success: false, error: 'خطا در بروزرسانی تنظیمات' };
  }
}
