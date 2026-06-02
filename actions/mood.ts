"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { localDateOnlyUTC } from "@/lib/week";

// One mood per day, but editable — tapping a new face updates today's value.
export async function setMood(score: number): Promise<void> {
  const userId = await requireUserId();
  if (!Number.isInteger(score) || score < 1 || score > 5) return;

  const entryDate = localDateOnlyUTC();
  await prisma.moodEntry.upsert({
    where: { userId_entryDate: { userId, entryDate } },
    create: { userId, entryDate, score },
    update: { score },
  });
  revalidatePath("/journal");
}
