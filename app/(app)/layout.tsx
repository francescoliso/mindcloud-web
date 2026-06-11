import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/db";
import { signOut } from "@/auth";
import { NavTabs } from "@/components/nav-tabs";
import { Logo } from "@/components/logo";

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
    <div className="min-h-screen">
      {/* Sticky frosted nav — matches the landing page */}
      <nav className="sticky top-0 z-20 border-b border-sky-100/70 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/journal" className="flex items-center gap-2">
            <Logo className="h-7 w-auto" />
            <span className="text-sm font-semibold tracking-tight">MindCloud</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-sm font-medium text-neutral-500 transition hover:text-sky-600">
              Settings
            </Link>
            <form action={doSignOut}>
              <button className="text-sm font-medium text-neutral-500 transition hover:text-sky-600">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <NavTabs />
        <main className="mt-8">{children}</main>
      </div>
    </div>
  );
}
