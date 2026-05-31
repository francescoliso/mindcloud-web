/**
 * One-off migration from the old Supabase database into Vercel/local Postgres.
 *
 * Run with env loaded:
 *   node --env-file=.env --import tsx scripts/migrate-from-supabase.ts
 *
 * Requires in .env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (service role: read all rows)
 *   MIGRATE_USER_EMAIL, MIGRATE_USER_PASSWORD (the account to own the data)
 *   DATABASE_URL (target Postgres)
 *
 * Idempotent: gratitude/reports upsert on their unique keys; journal entries
 * are cleared for the user and re-inserted.
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function dateOnlyUTC(value: string): Date {
  return new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.MIGRATE_USER_EMAIL;
  const password = process.env.MIGRATE_USER_PASSWORD;
  if (!url || !key || !email || !password) {
    throw new Error(
      "Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MIGRATE_USER_EMAIL, MIGRATE_USER_PASSWORD in .env",
    );
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // 1) Ensure the owning user exists.
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash },
    update: {},
  });
  console.log(`User: ${user.email} (${user.id})`);

  // 2) Journal entries — Supabase `transcript` maps to `content`.
  const { data: journals, error: jErr } = await supabase
    .from("journal_entries")
    .select("transcript, created_at");
  if (jErr) throw jErr;
  await prisma.journalEntry.deleteMany({ where: { userId: user.id } });
  for (const row of journals ?? []) {
    await prisma.journalEntry.create({
      data: {
        userId: user.id,
        content: (row as { transcript: string }).transcript ?? "",
        createdAt: new Date((row as { created_at: string }).created_at),
      },
    });
  }
  console.log(`Journal entries: ${journals?.length ?? 0}`);

  // 3) Gratitude items.
  const { data: grats, error: gErr } = await supabase
    .from("gratitude_items")
    .select("content, position, entry_date, created_at");
  if (gErr) throw gErr;
  for (const r of (grats ?? []) as {
    content: string;
    position: number;
    entry_date: string;
    created_at: string;
  }[]) {
    const entryDate = dateOnlyUTC(r.entry_date);
    await prisma.gratitudeItem.upsert({
      where: { userId_entryDate_position: { userId: user.id, entryDate, position: r.position } },
      create: {
        userId: user.id,
        content: r.content,
        position: r.position,
        entryDate,
        createdAt: new Date(r.created_at),
      },
      update: { content: r.content },
    });
  }
  console.log(`Gratitude items: ${grats?.length ?? 0}`);

  // 4) Weekly reports.
  const { data: reports, error: rErr } = await supabase
    .from("weekly_reports")
    .select("content, week_start, created_at");
  if (rErr) throw rErr;
  for (const r of (reports ?? []) as {
    content: string;
    week_start: string;
    created_at: string;
  }[]) {
    const weekStart = dateOnlyUTC(r.week_start);
    await prisma.weeklyReport.upsert({
      where: { userId_weekStart: { userId: user.id, weekStart } },
      create: {
        userId: user.id,
        content: r.content,
        weekStart,
        createdAt: new Date(r.created_at),
      },
      update: { content: r.content },
    });
  }
  console.log(`Weekly reports: ${reports?.length ?? 0}`);

  console.log("Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
