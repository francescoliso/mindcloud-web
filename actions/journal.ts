"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";

export async function createJournalEntry(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  await prisma.journalEntry.create({ data: { userId, content } });
  revalidatePath("/journal");
}

export async function deleteJournalEntry(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Scope by userId so a user can only delete their own entries.
  await prisma.journalEntry.deleteMany({ where: { id, userId } });
  revalidatePath("/journal");
}
