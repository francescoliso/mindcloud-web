import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Next.js 16 renamed Middleware to Proxy. We reuse the edge-safe authConfig
// (no bcrypt/Prisma) so the optimistic auth redirect runs at the edge.
// Next 16 requires the proxy to be a function export (default or named `proxy`).
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
