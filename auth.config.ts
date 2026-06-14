import type { NextAuthConfig } from "next-auth";

const USER_ROUTES = ["/journal", "/gratitude", "/reports", "/settings", "/welcome"];
const ADMIN_ROUTES = ["/admin"];

function isAdmin(email?: string | null): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  return !!adminEmail && !!email && email.toLowerCase() === adminEmail;
}

// Edge-safe config (no bcrypt / Prisma) — shared by middleware and the full
// auth instance. The Credentials provider is added in auth.ts (Node runtime).
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const email = auth?.user?.email;
      const admin = isAdmin(email);
      const path = nextUrl.pathname;

      const isUserRoute = USER_ROUTES.some((p) => path === p || path.startsWith(p + "/"));
      const isAdminRoute = ADMIN_ROUTES.some((p) => path === p || path.startsWith(p + "/"));
      const isAuthPage = path === "/login" || path === "/signup";

      // Protect all app routes from unauthenticated access
      if ((isUserRoute || isAdminRoute) && !isLoggedIn) return false;

      if (isLoggedIn) {
        // Admin can only access /admin — redirect away from user routes
        if (admin && isUserRoute) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        // Regular users can't access /admin — redirect to journal
        if (!admin && isAdminRoute) {
          return Response.redirect(new URL("/journal", nextUrl));
        }
        // After login / landing on home, send each role to the right place
        if (isAuthPage || path === "/") {
          return Response.redirect(new URL(admin ? "/admin" : "/journal", nextUrl));
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
