import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { JournalComposer } from "@/components/journal-composer";
import { MoodCheckin } from "@/components/mood-checkin";
import { JournalSearch } from "@/components/journal-search";
import { deleteJournalEntry } from "@/actions/journal";
import { formatDateTime } from "@/lib/format";
import { localDateOnlyUTC } from "@/lib/week";
import { decrypt } from "@/lib/crypto";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const userId = await requireUserId();
  const { q, tag } = await searchParams;
  const today = localDateOnlyUTC();

  const [allEntries, todayMood] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { userId, ...(tag ? { tags: { has: tag } } : {}) },
      orderBy: { createdAt: "desc" },
    }),
    prisma.moodEntry.findUnique({
      where: { userId_entryDate: { userId, entryDate: today } },
    }),
  ]);

  // Decrypt, then filter by free-text query in memory (content is ciphertext
  // in the DB, so substring search can't run in SQL).
  const query = q?.trim().toLowerCase() ?? "";
  const entries = allEntries
    .map((e) => ({ ...e, plain: decrypt(e.content) }))
    .filter((e) => (query ? e.plain.toLowerCase().includes(query) : true));

  const filtering = !!query || !!tag;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Today&apos;s Journal</h1>
        <p className="text-sm text-neutral-500">Write down what&apos;s on your mind.</p>
      </section>

      <MoodCheckin initial={todayMood?.score ?? null} />

      <JournalComposer />

      <JournalSearch initialQuery={q ?? ""} activeTag={tag} />

      <section className="space-y-3">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-sky-200 p-6 text-center text-sm text-neutral-500 dark:border-sky-900">
            {filtering
              ? "No entries match your search."
              : "No entries yet. Your journal history will appear here."}
          </p>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="card-soft">
              <div className="mb-1.5 flex items-center justify-between">
                <time className="text-xs text-neutral-500">{formatDateTime(entry.createdAt)}</time>
                <form action={deleteJournalEntry}>
                  <input type="hidden" name="id" value={entry.id} />
                  <button className="text-xs text-neutral-400 transition hover:text-red-500">
                    Delete
                  </button>
                </form>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.plain}</p>
              {entry.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {entry.tags.map((t) => (
                    <Link
                      key={t}
                      href={`/journal?tag=${encodeURIComponent(t)}`}
                      className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 transition hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300"
                    >
                      #{t}
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}
