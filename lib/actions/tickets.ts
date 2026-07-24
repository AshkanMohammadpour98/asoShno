"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TicketStatus, TicketType, TicketPriority } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createTicket(formData: {
  subject: string;
  type: TicketType;
  content: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "نشست شما منقضی شده است یا وارد حساب خود نشده‌اید. لطفاً دوباره وارد شوید.",
        code: "NOT_AUTHENTICATED"
      };
    }

    const userId = session.user.id;

    // Verify user exists in DB
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return {
        success: false,
        error: "حساب کاربری شما یافت نشد. لطفاً دوباره ثبت‌نام کنید یا وارد شوید.",
        code: "USER_NOT_FOUND"
      };
    }

    if (!formData.subject.trim() || !formData.content.trim()) {
       return { success: false, error: "موضوع و متن پیام نمی‌تواند خالی باشد." };
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject: formData.subject,
        type: formData.type,
        userId: userId,
        status: "OPEN",
        messages: {
          create: {
            content: formData.content,
            senderId: userId,
            isAdmin: false,
          },
        },
      },
    });

    revalidatePath("/profile/tickets");
    revalidatePath("/admin");

    return { success: true, data: ticket };
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return { success: false, error: error.message || "خطا در ایجاد تیکت" };
  }
}

export async function getUserTickets() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return [];

  try {
    return await prisma.ticket.findMany({
      where: { userId: userId },
      orderBy: { lastMessageAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { messages: true }
        }
      },
    });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    return [];
  }
}

export async function getTicketDetails(id: string) {
  const session = await auth();
  if (!session?.user) return null;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) return null;

  // Security check: only the owner or an admin can see the ticket
  if (ticket.userId !== session.user.id && session.user.role !== "ADMIN") {
    return null;
  }

  return ticket;
}

export async function addMessage(ticketId: string, content: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.",
        code: "NOT_AUTHENTICATED"
      };
    }

    if (!content.trim()) return { success: false, error: "متن پیام نمی‌تواند خالی باشد." };

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { userId: true, status: true }
    });

    if (!ticket) throw new Error("گفتگو یافت نشد.");
    if (ticket.status === 'CLOSED') throw new Error("این گفتگو بسته شده است.");

    // Determine if sender is acting as admin
    const isAdmin = (session.user as any).role === "ADMIN" && session.user.id !== ticket.userId;

    const message = await prisma.message.create({
      data: {
        content,
        ticketId,
        senderId: session.user.id,
        isAdmin,
      },
    });

    // Update ticket status and lastMessageAt
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        lastMessageAt: new Date(),
        status: isAdmin ? "ANSWERED" : "OPEN",
      },
    });

    revalidatePath(`/profile/tickets/${ticketId}`);
    revalidatePath("/profile/tickets");
    revalidatePath("/admin");

    return { success: true, data: message };
  } catch (error: any) {
    console.error("Error in addMessage:", error);
    return { success: false, error: error.message || "خطا در ارسال پیام" };
  }
}

export async function editMessage(messageId: string, content: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { senderId: true, ticketId: true }
    });

    if (!message) throw new Error("پیام یافت نشد.");
    if (message.senderId !== session.user.id) throw new Error("شما اجازه ویرایش این پیام را ندارید.");

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { content }
    });

    revalidatePath(`/profile/tickets/${message.ticketId}`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "خطا در ویرایش پیام" };
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { senderId: true, ticketId: true }
    });

    if (!message) throw new Error("پیام یافت نشد.");
    if (message.senderId !== session.user.id) throw new Error("شما اجازه حذف این پیام را ندارید.");

    await prisma.message.delete({
      where: { id: messageId }
    });

    revalidatePath(`/profile/tickets/${message.ticketId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "خطا در حذف پیام" };
  }
}

export async function deleteTicket(ticketId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { userId: true }
    });

    if (!ticket) throw new Error("تیکت یافت نشد.");

    // Only owner or admin can delete
    const isAdmin = (session.user as any).role === "ADMIN";
    if (ticket.userId !== session.user.id && !isAdmin) {
      throw new Error("شما اجازه حذف این گفتگو را ندارید.");
    }

    await prisma.ticket.delete({
      where: { id: ticketId }
    });

    revalidatePath("/profile/tickets");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "خطا در حذف گفتگو" };
  }
}

export async function markAsRead(ticketId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { userId: true }
    });

    if (!ticket) return;

    // If the current user is the owner, they are reading admin messages
    // If the current user is an admin (and not the owner), they are reading customer messages
    const isOwner = session.user.id === ticket.userId;
    const isAdminStaff = (session.user as any).role === "ADMIN" && !isOwner;

    await prisma.message.updateMany({
      where: {
        ticketId,
        isAdmin: isOwner, // Mark admin messages if I'm the owner, or mark customer messages if I'm admin staff
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath(`/profile/tickets/${ticketId}`);
    revalidatePath("/profile/tickets");
    revalidatePath("/admin");
  } catch (error) {
    console.error("Error marking as read:", error);
  }
}

export async function getUnreadCount() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  if (!userId) return 0;

  const isAdmin = role === "ADMIN";

  try {
    return await prisma.message.count({
      where: {
        isAdmin: !isAdmin,
        isRead: false,
        ticket: isAdmin ? {} : { userId: userId },
      },
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
}

export async function getAllTickets(filters?: { status?: TicketStatus; type?: TicketType; userId?: string }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") throw new Error("Unauthorized");

  const where: any = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.type) where.type = filters.type;
  if (filters?.userId) where.userId = filters.userId;

  try {
    return await prisma.ticket.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { messages: true }
        }
      },
    });
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    return [];
  }
}

export async function startConversation(userId: string, subject: string, content: string) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user?.id || (user as any).role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        userId,
        status: "ANSWERED",
        messages: {
          create: {
            content,
            senderId: user.id,
            isAdmin: true,
          },
        },
      },
    });

    revalidatePath("/admin");
    revalidatePath("/profile/tickets");

    return { success: true, data: ticket };
  } catch (error: any) {
    console.error("Error starting conversation:", error);
    return { success: false, error: error.message || "خطا در ایجاد گفتگو" };
  }
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" || !session?.user?.id) throw new Error("Unauthorized");

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
  });

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
}
