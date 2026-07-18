import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ phone: z.string(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { phone, password } = parsedCredentials.data;

          const user = await prisma.user.findUnique({
            where: { phone },
          });

          console.log("Found user:", user ? "Yes" : "No");

          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          console.log("Password match:", passwordsMatch);

          if (passwordsMatch) {
            return {
              id: user.id,
              phone: user.phone,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
            };
          }
        }

        return null;
      },
    }),
  ],
});
