import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { JournalComposer } from "@/components/journal-composer";
import { MoodCheckin } from "@/components/mood-checkin";
import { deleteJournalEntry } from "@/actions/journal";
import { formatDateTime } from "@/lib/format";
import { localDateOnlyUTC } from "@/lib/week";

export default async function JournalPage() {
  const userId = await requireUserId();
  const today = localDateOnlyUTC();
  const [entries, todayMood] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.moodEntry.findUnique({
      where: { userId_entryDate: { userId, entryDate: today } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-xl font-semibold tracking-tight">Today&apos;s Journal</h1>
        <p className="text-sm text-neutral-500">Write down what&apos;s on your mind.</p>
      </section>

      <MoodCheckin initial={todayMood?.score ?? null} />

      <JournalComposer />

      <section className="space-y-3">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-sky-200 p-6 text-center text-sm text-neutral-500 dark:border-sky-900">
            No entries yet. Your journal history will appear here.
          </p>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="card-soft"
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
