"use server";

import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { signOut } from "@/auth";
import { sendAccountDeleted } from "@/lib/email";

// Permanently deletes the signed-in user's account and all their data.
// Related rows (journal, gratitude, mood, reports) cascade automatically.
// A churn record is written first — it holds no personal data, only the
// account age and onboarding status, so the dashboard can track quitters.
export async function deleteAccount(): Promise<void> {
  const userId = await requireUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, createdAt: true, onboardedAt: true },
  });
  if (!user) return;

  await prisma.$transaction([
    prisma.accountDeletion.create({
      data: {
        accountCreatedAt: user.createdAt,
        wasOnboarded: user.onboardedAt !== null,
      },
    }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  // Confirmation email (best-effort — never blocks the deletion).
  try {
    await sendAccountDeleted(user.email);
  } catch (err) {
    console.error("[account] deletion email failed:", err);
  }

  await signOut({ redirectTo: "/" });
}
