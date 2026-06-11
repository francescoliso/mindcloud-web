import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

// Best-effort client IP from the proxy headers (Vercel sets x-forwarded-for).
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

// Atomic fixed-window limiter. Returns true if the call is allowed.
// One round-trip: an upsert that resets the counter when the window has passed.
export async function rateLimit(
  key: string,
  max: number,
  windowSec: number,
): Promise<boolean> {
  const windowEnd = new Date(Date.now() + windowSec * 1000);
  try {
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "windowEnd")
      VALUES (${key}, 1, ${windowEnd})
      ON CONFLICT ("key") DO UPDATE SET
        "count"     = CASE WHEN "RateLimit"."windowEnd" < now() THEN 1 ELSE "RateLimit"."count" + 1 END,
        "windowEnd" = CASE WHEN "RateLimit"."windowEnd" < now() THEN ${windowEnd} ELSE "RateLimit"."windowEnd" END
      RETURNING "count";
    `;
    const count = Number(rows[0]?.count ?? 1);
    return count <= max;
  } catch {
    // Fail open — a limiter outage must never lock users out.
    return true;
  }
}
