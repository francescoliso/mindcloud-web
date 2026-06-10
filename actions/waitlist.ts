"use server";

import { randomBytes } from "crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { sendWaitlistConfirmation, sendInvite } from "@/lib/email";

function appUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export type WaitlistState = { ok?: boolean; error?: string; message?: string };

// Public: join the waitlist.
export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const parsed = z.object({ email: z.string().email() }).safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: "Please enter a valid email address." };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.waitlistEntry.findUnique({ where: { email } });
  if (existing) {
    return { ok: true, message: "You're already on the list — we'll be in touch." };
  }

  await prisma.waitlistEntry.create({ data: { email } });
  await sendWaitlistConfirmation(email);
  return { ok: true, message: "You're on the list! We'll email you when your invite is ready." };
}

// Admin: approve a pending entry, generate an invite token, and email the link.
export async function approveAndInvite(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const entry = await prisma.waitlistEntry.findUnique({ where: { id } });
  if (!entry) return;

  const token = randomBytes(24).toString("hex");
  await prisma.waitlistEntry.update({
    where: { id },
    data: {
      status: "INVITED",
      inviteToken: token,
      invitedAt: new Date(),
      tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await sendInvite(entry.email, `${appUrl()}/signup?token=${token}`);
  revalidatePath("/admin/waitlist");
}
