import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { localDateOnlyUTC } from "@/lib/week";
import { formatDateOnly } from "@/lib/format";
import { GratitudeForm } from "@/components/gratitude-form";

export default async function GratitudePage() {
  const userId = await requireUserId();
  const today = localDateOnlyUTC();

  const [todayItems, allItems] = await Promise.all([
    prisma.gratitudeItem.findMany({
      where: { userId, entryDate: today },
      orderBy: { position: "asc" },
    }),
    prisma.gratitudeItem.findMany({
      where: { userId },
      orderBy: [{ entryDate: "desc" }, { position: "asc" }],
    }),
  ]);

  const completedToday = new Set(todayItems.map((i) => i.position)).size === 3;

  // Group history by day (exclude today — it's shown above).
  const history = new Map<number, typeof allItems>();
  for (const item of allItems) {
    const key = item.entryDate.getTime();
    if (key === today.getTime()) continue;
    if (!history.has(key)) history.set(key, []);
    history.get(key)!.push(item);
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Gratitude</h1>
        <p className="text-sm text-neutral-500">Three things you&apos;re thankful for today.</p>
      </section>

      {completedToday ? (
        <section className="rounded-3xl border border-pink-200 bg-pink-50/60 p-6 dark:border-pink-900/40 dark:bg-pink-950/20">
          <p className="mb-3 text-sm font-medium text-pink-700 dark:text-pink-300">
            ✓ Today&apos;s gratitude is complete
          </p>
          <ul className="space-y-2">
            {todayItems.map((item) => (
              <li key={item.id} className="flex gap-2 text-sm">
                <span className="text-pink-500">{item.position}.</span>
                <span>{item.content}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-neutral-500">Come back tomorrow for your next entry.</p>
        </section>
      ) : (
        <GratitudeForm />
      )}

      {history.size > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-neutral-500">History</h2>
          {[...history.entries()].map(([key, items]) => (
            <div key={key} className="card-soft">
              <p className="mb-2 text-xs font-medium text-neutral-500">
                {formatDateOnly(items[0].entryDate)}
              </p>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-2 text-sm">
                    <span className="text-pink-500">{item.position}.</span>
                    <span>{item.content}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
