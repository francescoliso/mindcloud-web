import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { auth } from "@/auth";
import { DeleteAccount } from "@/components/delete-account";
import { formatDateOnly } from "@/lib/format";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const [session, user] = await Promise.all([
    auth(),
    prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
        <p className="text-sm text-neutral-500">Manage your account.</p>
      </section>

      <section className="card-soft space-y-2">
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-neutral-500">Email</span>
          <span className="font-medium">{session?.user?.email}</span>
        </div>
        {user && (
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-neutral-500">Member since</span>
            <span className="font-medium">{formatDateOnly(user.createdAt)}</span>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-500">Your data</h2>
        <p className="text-sm text-neutral-500">
          Download everything you&apos;ve written — journal, gratitude, moods, and reports — as a
          JSON file.
        </p>
        <a
          href="/api/export"
          download
          className="inline-flex rounded-full border border-sky-300 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50 dark:border-sky-900 dark:text-sky-300 dark:hover:bg-sky-950/30"
        >
          Export my data
        </a>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-rose-600">Danger zone</h2>
        <DeleteAccount />
      </section>
    </div>
  );
}
