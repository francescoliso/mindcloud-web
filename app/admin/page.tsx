import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const excludeAdmin = adminEmail ? { email: { not: adminEmail } } : undefined;

  const [
    users,
    onboarded,
    deletions,
    waitlistPending,
    waitlistInvited,
    waitlistRegistered,
  ] = await Promise.all([
    prisma.user.count({ where: excludeAdmin }),
    prisma.user.count({ where: { onboardedAt: { not: null }, ...excludeAdmin } }),
    prisma.accountDeletion.count(),
    prisma.waitlistEntry.count({ where: { status: "PENDING" } }),
    prisma.waitlistEntry.count({ where: { status: "INVITED" } }),
    prisma.waitlistEntry.count({ where: { status: "REGISTERED" } }),
  ]);

  // Of everyone who ever had an account (current + deleted), how many left.
  const everRegistered = users + deletions;
  const churnRate = everRegistered > 0 ? Math.round((deletions / everRegistered) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-neutral-500">An overview of MindCloud.</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-neutral-500">Users</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Registered" value={users} accent="sky" />
          <Metric label="Onboarded" value={onboarded} accent="green" />
          <Metric label="Quit" value={deletions} accent="rose" />
          <Metric label="Churn rate" value={`${churnRate}%`} accent="neutral" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-neutral-500">Waitlist</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Pending" value={waitlistPending} accent="amber" />
          <Metric label="Invited" value={waitlistInvited} accent="sky" />
          <Metric label="Registered" value={waitlistRegistered} accent="green" />
        </div>
      </section>
    </div>
  );
}

const ACCENTS: Record<string, string> = {
  sky: "text-sky-600",
  green: "text-green-600",
  rose: "text-rose-600",
  amber: "text-amber-600",
  neutral: "text-neutral-700 dark:text-neutral-200",
};

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: keyof typeof ACCENTS | string;
}) {
  return (
    <div className="rounded-2xl bg-sky-50/70 p-4 dark:bg-slate-800/50">
      <p className={`text-3xl font-semibold ${ACCENTS[accent] ?? ACCENTS.neutral}`}>{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{label}</p>
    </div>
  );
}
