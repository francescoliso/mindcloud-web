import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { JournalComposer } from "@/components/journal-composer";
import { deleteJournalEntry } from "@/actions/journal";
import { formatDateTime } from "@/lib/format";

export default async function JournalPage() {
  const userId = await requireUserId();
  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-xl font-semibold tracking-tight">Today&apos;s Journal</h1>
        <p className="text-sm text-neutral-500">Write down what&apos;s on your mind.</p>
      </section>

      <JournalComposer />

      <section className="space-y-3">
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
            No entries yet. Your journal history will appear here.
          </p>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <time className="text-xs text-neutral-500">{formatDateTime(entry.createdAt)}</time>
                <form action={deleteJournalEntry}>
                  <input type="hidden" name="id" value={entry.id} />
                  <button className="text-xs text-neutral-400 transition hover:text-red-500">
                    Delete
                  </button>
                </form>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.content}</p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
