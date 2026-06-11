import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      createdAt: true,
      onboardedAt: true,
      _count: {
        select: {
          journalEntries: true,
          gratitudeItems: true,
          weeklyReports: true,
          moodEntries: true,
        },
      },
    },
  });

  const onboarded = users.filter((u) => u.onboardedAt).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Users</h1>
        <p className="text-sm text-neutral-500">
          {users.length} registered · {onboarded} onboarded
        </p>
      </div>

      {users.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sky-200 p-6 text-center text-sm text-neutral-500 dark:border-sky-900">
          No registered users yet. Invite people from the Waitlist tab.
        </p>
      ) : (
        <ul className="space-y-3">
          {users.map((u) => (
            <li key={u.id} className="card-soft">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.email}</p>
                  <p className="text-xs text-neutral-400">
                    Joined {formatDateTime(u.createdAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.onboardedAt
                      ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                  }`}
                >
                  {u.onboardedAt ? "onboarded" : "not onboarded"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                <Stat label="Journal" value={u._count.journalEntries} />
                <Stat label="Gratitude" value={u._count.gratitudeItems} />
                <Stat label="Moods" value={u._count.moodEntries} />
                <Stat label="Reports" value={u._count.weeklyReports} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-sky-50/70 py-2 dark:bg-slate-800/50">
      <p className="text-base font-semibold">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
