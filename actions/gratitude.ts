"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { localDateOnlyUTC } from "@/lib/week";
import { encrypt } from "@/lib/crypto";

export type GratitudeState = { error?: string };

export async function saveGratitude(
  _prev: GratitudeState,
  formData: FormData,
): Promise<GratitudeState> {
  const userId = await requireUserId();
  const entryDate = localDateOnlyUTC();

  // Once-per-day hard lock: if all three are already saved, no-op.
  const existing = await prisma.gratitudeItem.findMany({ where: { userId, entryDate } });
  if (new Set(existing.map((i) => i.position)).size === 3) return {};

  const items = [1, 2, 3].map((pos) => String(formData.get(`item${pos}`) ?? "").trim());
  if (items.some((t) => t.length === 0)) {
    return { error: "Please fill in all three before saving." };
  }
  if (items.some((t) => t.length > 500)) {
    return { error: "Each item must be under 500 characters." };
  }

  await prisma.$transaction(
    items.map((content, idx) =>
      prisma.gratitudeItem.upsert({
        where: {
          userId_entryDate_position: { userId, entryDate, position: idx + 1 },
        },
        create: { userId, entryDate, position: idx + 1, content: encrypt(content) },
        update: { content: encrypt(content) },
      }),
    ),
  );

  revalidatePath("/gratitude");
  return {};
}
