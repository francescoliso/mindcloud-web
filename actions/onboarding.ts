"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";

export async function finishOnboarding(): Promise<void> {
  const userId = await requireUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { onboardedAt: new Date() },
  });
  redirect("/journal");
}
