"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { DIMENSION_KEYS, type Goals, type Current } from "@/lib/dimensions";

function parseScore(raw: FormDataEntryValue | null): number {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(10, Math.max(1, Math.round(n))) : 5;
}

export async function saveLifeWheel(_: unknown, formData: FormData) {
  const userId = await requireUserId();

  const goals: Goals = {} as Goals;
  const current: Current = {} as Current;

  for (const key of DIMENSION_KEYS) {
    goals[key] = parseScore(formData.get(`goal_${key}`));
    const comment = String(formData.get(`comment_${key}`) ?? "").trim().slice(0, 1000);
    current[key] = {
      score:   parseScore(formData.get(`score_${key}`)),
      comment,
    };
  }

  await prisma.lifeWheel.upsert({
    where:  { userId },
    update: { goals, current },
    create: { userId, goals, current },
  });

  revalidatePath("/wheel");
}
