import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { auth } from "@/auth";
import { decrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";

// Full account export — everything the user has stored, decrypted, as a
// downloadable JSON file. "Your words stay yours."
export async function GET() {
  const userId = await requireUserId();
  const session = await auth();

  const [user, journal, gratitude, moods, reports] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, createdAt: true, onboardedAt: true },
    }),
    prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.gratitudeItem.findMany({
      where: { userId },
      orderBy: [{ entryDate: "asc" }, { position: "asc" }],
    }),
    prisma.moodEntry.findMany({ where: { userId }, orderBy: { entryDate: "asc" } }),
    prisma.weeklyReport.findMany({ where: { userId }, orderBy: { weekStart: "asc" } }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    account: { email: session?.user?.email ?? user?.email, createdAt: user?.createdAt },
    journal: journal.map((e) => ({ content: decrypt(e.content), createdAt: e.createdAt })),
    gratitude: gratitude.map((g) => ({
      content: decrypt(g.content),
      position: g.position,
      entryDate: g.entryDate,
    })),
    moods: moods.map((m) => ({ score: m.score, entryDate: m.entryDate })),
    weeklyReports: reports.map((r) => ({ content: decrypt(r.content), weekStart: r.weekStart })),
  };

  const date = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="mindcloud-export-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
