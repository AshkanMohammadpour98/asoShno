'use server';

import { prisma } from '../prisma';
import { auth } from '../auth';
import { revalidatePath } from 'next/cache';

export async function toggleWishlist(productId: string) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: 'NOT_AUTHENTICATED' };
    }

    const userId = session.user.id;

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id }
      });
      revalidatePath(`/shop/product/${productId}`);
      revalidatePath("/admin");
      return { success: true, action: 'REMOVED' };
    } else {
      await prisma.wishlist.create({
        data: {
          userId,
          productId
        }
      });
      revalidatePath(`/shop/product/${productId}`);
      revalidatePath("/admin");
      return { success: true, action: 'ADDED' };
    }
  } catch (error) {
    console.error('Wishlist error:', error);
    return { success: false, error: 'خطایی در سیستم رخ داد.' };
  }
}

export async function getWishlistIds() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return [];
    }

    const items = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      select: { productId: true }
    });

    return items.map(item => item.productId);
  } catch (error) {
    console.error('getWishlistIds error:', error);
    return [];
  }
}
