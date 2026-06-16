"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { encrypt } from "@/lib/crypto";

export async function createJournalEntry(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;
  if (content.length > 50000) return;

  // Parse comma-separated tags into a clean, de-duped, lowercased list.
  const tags = Array.from(
    new Set(
      String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 10);

  await prisma.journalEntry.create({ data: { userId, content: encrypt(content), tags } });
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
