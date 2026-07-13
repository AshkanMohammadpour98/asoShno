import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isProfileRoute = nextUrl.pathname.startsWith("/profile");
      const isAuthPage = nextUrl.pathname === "/login" || nextUrl.pathname === "/signup";

      // 1. If trying to access admin area, must be logged in AND be an ADMIN
      if (isAdminRoute) {
        if (!isLoggedIn) return false; // Redirects to login
        if (role !== "ADMIN") return Response.redirect(new URL("/", nextUrl));
      }

      // 2. If trying to access profile, must be logged in
      if (isProfileRoute) {
        if (!isLoggedIn) return false;
      }

      // 3. If already logged in and tries to go to login/signup page, redirect them away
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL(role === "ADMIN" ? "/admin" : "/profile", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Providers will be added in auth.ts (Node.js runtime)
} satisfies NextAuthConfig;
