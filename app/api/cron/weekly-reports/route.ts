import { generateWeeklyReport, usersWithWeeklyActivity } from "@/lib/reports";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Weekly cron (see vercel.json) — generates each active user's report so it's
// ready without anyone clicking "Generate". Protected by CRON_SECRET; Vercel
// Cron sends it as a Bearer token automatically.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron] CRON_SECRET is not set — endpoint is unprotected, refusing to run.");
    return new Response("CRON_SECRET not configured", { status: 500 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userIds = await usersWithWeeklyActivity();
  let ok = 0;
  let failed = 0;

  for (const userId of userIds) {
    try {
      await generateWeeklyReport(userId);
      ok++;
    } catch (err) {
      failed++;
      console.error(`[cron] weekly report failed for ${userId}:`, err);
    }
  }

  return Response.json({ processed: userIds.length, ok, failed });
}
