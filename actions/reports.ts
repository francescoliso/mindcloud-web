"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { weekStart as weekStartOf, localDateOnlyUTC } from "@/lib/week";
import { weeklyReportPrompt, completeWeeklyReport } from "@/lib/claude";

export type ReportState = { error?: string; ok?: boolean };

export async function generateReport(
  _prev: ReportState,
  _formData: FormData,
): Promise<ReportState> {
  const userId = await requireUserId();
  const monday = weekStartOf(); // local Monday 00:00 (absolute instant)
  const weekStartDate = localDateOnlyUTC(monday); // key for the @db.Date column

  try {
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
      entries.map((e) => ({ content: e.content, createdAt: e.createdAt })),
      gratitude.map((g) => ({ content: g.content })),
      moods.map((m) => ({ score: m.score, entryDate: m.entryDate })),
    );
    const content = await completeWeeklyReport(prompt);

    await prisma.weeklyReport.upsert({
      where: { userId_weekStart: { userId, weekStart: weekStartDate } },
      create: { userId, weekStart: weekStartDate, content },
      update: { content },
    });

    revalidatePath("/reports");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate report." };
  }
}
