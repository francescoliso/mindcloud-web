import { redirect } from "next/navigation";
import { auth } from "@/auth";

export function isAdmin(email?: string | null): boolean {
  const admin = process.env.ADMIN_EMAIL?.toLowerCase();
  return !!admin && !!email && email.toLowerCase() === admin;
}

// Authoritative admin gate for server components/actions.
export async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/journal");
}
