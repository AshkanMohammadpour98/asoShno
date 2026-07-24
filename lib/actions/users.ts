"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getAllUsers(filters?: { search?: string; role?: Role; page?: number; limit?: number }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters?.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters?.role) {
    where.role = filters.role;
  }

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: {
            select: { tickets: true, messages: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "خطا در دریافت لیست کاربران" };
  }
}

export async function getUserDetails(userId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            tickets: true,
            wishlists: true,
          }
        },
        tickets: {
          orderBy: { lastMessageAt: "desc" },
          take: 5,
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1
            }
          }
        }
      }
    });

    if (!user) return { success: false, error: "کاربر یافت نشد" };

    // Don't return password
    const { password, ...userWithoutPassword } = user;

    return { success: true, data: userWithoutPassword };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return { success: false, error: "خطا در دریافت اطلاعات کاربر" };
  }
}

export async function updateUserRole(userId: string, role: Role) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "خطا در بروزرسانی نقش کاربر" };
  }
}
