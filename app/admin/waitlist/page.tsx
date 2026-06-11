import { prisma } from "@/lib/db";
import { approveAndInvite } from "@/actions/waitlist";
import { CopyField } from "@/components/copy-field";
import { formatDateTime } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  INVITED: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  REGISTERED: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
};

export default async function AdminWaitlistPage() {
  const entries = await prisma.waitlistEntry.findMany({ orderBy: { createdAt: "desc" } });
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Waitlist</h1>
        <p className="text-sm text-neutral-500">{entries.length} signups · approve to send an invite.</p>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sky-200 p-6 text-center text-sm text-neutral-500 dark:border-sky-900">
          No signups yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="card-soft">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.email}</p>
                  <p className="text-xs text-neutral-400">{formatDateTime(e.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[e.status]}`}>
                    {e.status.toLowerCase()}
                  </span>
                  {e.status === "PENDING" && (
                    <form action={approveAndInvite}>
                      <input type="hidden" name="id" value={e.id} />
                      <button className="rounded-full bg-sky-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700">
                        Approve &amp; invite
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {e.status === "INVITED" && e.inviteToken && (
                <div className="mt-3">
                  <p className="mb-1 text-xs text-neutral-500">Invite link (also emailed):</p>
                  <CopyField value={`${appUrl}/signup?token=${e.inviteToken}`} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
