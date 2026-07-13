"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

const RegisterSchema = z.object({
  firstName: z.string().min(1, "نام الزامی است"),
  lastName: z.string().min(1, "نام خانوادگی الزامی است"),
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "رمز عبور و تکرار آن یکسان نیستند",
  path: ["confirmPassword"],
});

export type ActionState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    phone?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function registerUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = RegisterSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "فیلدهای فرم را به درستی پر کنید.",
    };
  }

  const { firstName, lastName, phone, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return {
        errors: { phone: ["این شماره قبلاً ثبت شده است"] },
        message: "خطا در ثبت‌نام",
      };
    }

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    return { success: true, message: "ثبت‌نام با موفقیت انجام شد." };
  } catch (error) {
    console.error("Registration error:", error);
    return { message: "خطای سیستمی رخ داده است. لطفاً بعداً تلاش کنید." };
  }
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const redirectTo = (rawData.callbackUrl as string) || (rawData.role === 'ADMIN' ? '/admin' : '/profile');

    await signIn("credentials", {
      ...rawData,
      redirectTo
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "شماره تلفن یا رمز عبور اشتباه است.";
        default:
          return "خطایی در ورود رخ داد.";
      }
    }
    throw error;
  }
}

const ProfileSchema = z.object({
  firstName: z.string().min(1, "نام الزامی است"),
  lastName: z.string().min(1, "نام خانوادگی الزامی است"),
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
});

export async function updateProfile(userId: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = ProfileSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "فیلدها را به درستی پر کنید.",
    };
  }

  const { firstName, lastName, phone } = validatedFields.data;

  try {
    // Check if phone is taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        phone,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return {
        errors: { phone: ["این شماره توسط کاربر دیگری استفاده شده است"] },
        message: "خطا در بروزرسانی",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, phone },
    });

    return { success: true, message: "پروفایل با موفقیت بروزرسانی شد." };
  } catch (error) {
    console.error("Update profile error:", error);
    return { message: "خطای سیستمی رخ داده است." };
  }
}
