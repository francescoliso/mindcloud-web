import type { NextAuthConfig } from "next-auth";

const APP_ROUTES = ["/journal", "/gratitude", "/reports"];

// Edge-safe config (no bcrypt / Prisma) — shared by middleware and the full
// auth instance. The Credentials provider is added in auth.ts (Node runtime).
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isAppRoute = APP_ROUTES.some((p) => path === p || path.startsWith(p + "/"));
      const isAuthPage = path === "/login" || path === "/signup";

      if (isAppRoute) return isLoggedIn;
      if (isLoggedIn && (isAuthPage || path === "/")) {
        return Response.redirect(new URL("/journal", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
