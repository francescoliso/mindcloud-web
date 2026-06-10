import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight">MindCloud · Admin</span>
        <Link href="/journal" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
          Back to app
        </Link>
      </header>
      {children}
    </div>
  );
}
