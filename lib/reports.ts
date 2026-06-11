import "server-only";
import { prisma } from "@/lib/db";
import { weekStart as weekStartOf, localDateOnlyUTC } from "@/lib/week";
import { weeklyReportPrompt, completeWeeklyReport } from "@/lib/claude";
import { encrypt, decrypt } from "@/lib/crypto";

// Generates (or refreshes) the current week's report for one user.
// Shared by the on-demand action and the weekly cron job.
export async function generateWeeklyReport(userId: string): Promise<void> {
  const monday = weekStartOf();
  const weekStartDate = localDateOnlyUTC(monday);

  const [entries, gratitude, moods] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { userId, createdAt: { gte: monday } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.gratitudeItem.findMany({
      where: { userId, entryDate: { gte: weekStartDate } },
      orderBy: [{ entryDate: "asc" }, { position: "asc" }],
    }),
    prisma.moodEntry.findMany({
      where: { userId, entryDate: { gte: weekStartDate } },
      orderBy: { entryDate: "asc" },
    }),
  ]);

  const prompt = weeklyReportPrompt(
    entries.map((e) => ({ content: decrypt(e.content), createdAt: e.createdAt })),
    gratitude.map((g) => ({ content: decrypt(g.content) })),
    moods.map((m) => ({ score: m.score, entryDate: m.entryDate })),
  );
  const content = await completeWeeklyReport(prompt);

  await prisma.weeklyReport.upsert({
    where: { userId_weekStart: { userId, weekStart: weekStartDate } },
    create: { userId, weekStart: weekStartDate, content: encrypt(content) },
    update: { content: encrypt(content) },
  });
}

// Returns userIds that have any activity in the current week (worth a report).
export async function usersWithWeeklyActivity(): Promise<string[]> {
  const monday = weekStartOf();
  const weekStartDate = localDateOnlyUTC(monday);

  const [j, g, m] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { createdAt: { gte: monday } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.gratitudeItem.findMany({
      where: { entryDate: { gte: weekStartDate } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.moodEntry.findMany({
      where: { entryDate: { gte: weekStartDate } },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ]);

  return [...new Set([...j, ...g, ...m].map((r) => r.userId))];
}
