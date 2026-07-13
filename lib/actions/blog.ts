'use server';

import {
  getLocalBlogPosts,
  addLocalBlogPost,
  updateLocalBlogPost,
  deleteLocalBlogPost,
  getLocalBlogCategories,
  addLocalBlogCategory,
  deleteLocalBlogCategory
} from '../db';
import { BlogPost } from '../types';
import { uploadPostImage, deleteS3Object, deleteS3Folder } from '../upload-image';
import { revalidatePath } from 'next/cache';
import { prisma } from '../prisma';
import crypto from 'crypto';

export async function getBlogPosts(filters?: { search?: string; category?: string }) {
  try {
    const data = await getLocalBlogPosts(filters);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت مقالات' };
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const posts = await getLocalBlogPosts();
    const post = posts.find(p => p.slug === slug);
    if (!post) return { success: false, error: 'مقاله پیدا نشد' };
    return { success: true, data: post };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت مقاله' };
  }
}

export async function createBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>, imageFile?: File) {
  try {
    // Generate a UUID for the post to use in the S3 folder structure
    const postId = crypto.randomUUID();
    let imageKey = post.featuredImage;

    if (imageFile) {
      imageKey = await uploadPostImage(postId, imageFile);
    }

    const newPost = await addLocalBlogPost({
      ...post,
      featuredImage: imageKey
    });

    revalidatePath('/blog');
    revalidatePath('/admin');
    return { success: true, data: newPost };
  } catch (error) {
    console.error('Create Blog Post Error:', error);
    return { success: false, error: 'خطا در ثبت مقاله' };
  }
}

export async function updateBlogPost(id: string, post: Partial<BlogPost>, imageFile?: File) {
  try {
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    let imageKey = post.featuredImage || existing?.featuredImage || '';

    if (imageFile) {
      // Delete old image if exists
      if (existing?.featuredImage) {
        await deleteS3Object(existing.featuredImage);
      }
      imageKey = await uploadPostImage(id, imageFile);
    }

    const updated = await updateLocalBlogPost(id, {
      ...post,
      featuredImage: imageKey
    });

    revalidatePath('/blog');
    revalidatePath(`/blog/${updated?.slug}`);
    revalidatePath('/admin');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Update Blog Post Error:', error);
    return { success: false, error: 'خطا در بروزرسانی مقاله' };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    // Delete the virtual folder in S3 for this post
    await deleteS3Folder('posts', id);

    // Delete the DB record
    await deleteLocalBlogPost(id);

    revalidatePath('/blog');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Delete Blog Post Error:', error);
    return { success: false, error: 'خطا در حذف مقاله' };
  }
}

/**
 * Blog Categories
 */
export async function getBlogCategories() {
  try {
    const { getMergedBlogCategories } = await import('../db');
    const data = await getMergedBlogCategories();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'خطا در دریافت دسته‌بندی‌ها' };
  }
}

export async function createBlogCategory(name: string) {
  try {
    const data = await addLocalBlogCategory(name);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'خطا در ثبت دسته‌بندی' };
  }
}

export async function deleteBlogCategory(id: string) {
  try {
    await deleteLocalBlogCategory(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'خطا در حذف دسته‌بندی' };
  }
}
