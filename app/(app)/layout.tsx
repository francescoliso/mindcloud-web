import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/db";
import { signOut } from "@/auth";
import { NavTabs } from "@/components/nav-tabs";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardedAt: true },
  });
  if (!user?.onboardedAt) redirect("/welcome");

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center justify-between">
        <Link href="/journal" className="text-lg font-semibold tracking-tight">
          MindCloud
        </Link>
        <form action={doSignOut}>
          <button className="text-sm text-neutral-500 transition hover:text-neutral-800 dark:hover:text-neutral-200">
            Sign out
          </button>
        </form>
      </header>
      <NavTabs />
      <main className="mt-6">{children}</main>
    </div>
  );
}
