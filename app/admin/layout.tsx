import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Logo } from "@/components/logo";
import { AdminTabs } from "@/components/admin-tabs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-20 border-b border-sky-100/70 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-auto" />
            <span className="text-sm font-semibold tracking-tight">MindCloud · Admin</span>
          </div>
          <Link href="/journal" className="text-sm font-medium text-neutral-500 transition hover:text-sky-600">
            Back to app
          </Link>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <AdminTabs />
        {children}
      </div>
    </div>
  );
}
