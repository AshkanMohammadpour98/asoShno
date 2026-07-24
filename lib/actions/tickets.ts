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
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to send a message.");
  }

  const userId = session.user.id;

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
  revalidatePath("/admin/tickets");

  return ticket;
}

export async function getUserTickets() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.ticket.findMany({
    where: { userId: session.user.id },
    orderBy: { lastMessageAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = session.user.role === "ADMIN";

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
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/profile/tickets");
  revalidatePath("/admin/tickets");

  return message;
}

export async function markAsRead(ticketId: string) {
  const session = await auth();
  if (!session?.user) return;

  const isAdmin = session.user.role === "ADMIN";

  // If admin reads, mark user messages as read. If user reads, mark admin messages as read.
  await prisma.message.updateMany({
    where: {
      ticketId,
      isAdmin: !isAdmin,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath(`/profile/tickets/${ticketId}`);
  revalidatePath("/profile/tickets");
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const isAdmin = session.user.role === "ADMIN";

  return await prisma.message.count({
    where: {
      isAdmin: !isAdmin,
      isRead: false,
      ticket: isAdmin ? {} : { userId: session.user.id },
    },
  });
}

export async function getAllTickets(filters?: { status?: TicketStatus; type?: TicketType }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  return await prisma.ticket.findMany({
    where: filters,
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
        take: 1,
      },
    },
  });
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
  });

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
}
