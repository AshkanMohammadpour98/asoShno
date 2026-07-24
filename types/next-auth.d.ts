import { Role } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    phone?: string;
    role?: Role;
    firstName?: string;
    lastName?: string;
  }

  interface Session {
    user: {
      id: string;
      phone: string;
      role: Role;
      firstName: string;
      lastName: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone: string;
    role: Role;
    firstName: string;
    lastName: string;
  }
}
