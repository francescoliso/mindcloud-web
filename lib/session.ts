import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Authoritative server-side check. Proxy is only an optimistic gate, so every
// page/action that touches user data must call this.
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  return id;
}
