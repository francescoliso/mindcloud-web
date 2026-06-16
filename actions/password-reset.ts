"use server";

import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendPasswordReset } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export type ResetState = { error?: string; ok?: boolean };

function appUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  if (!(await rateLimit(`reset-request:${await clientIp()}`, 5, 3600))) {
    return { error: "Too many attempts. Please try again later." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Enter your email address." };

  // Always return success — never reveal whether the email exists.
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Invalidate any previous unused tokens for this email.
    await prisma.passwordResetToken.updateMany({
      where: { email, usedAt: null },
      data: { usedAt: new Date() },
    });

    await prisma.passwordResetToken.create({ data: { email, tokenHash, expiresAt } });
    await sendPasswordReset(email, `${appUrl()}/reset-password?token=${token}`);
  }

  return { ok: true };
}

export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  if (!(await rateLimit(`reset-submit:${await clientIp()}`, 10, 3600))) {
    return { error: "Too many attempts. Please try again later." };
  }

  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) return { error: "Invalid reset link." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const user = await prisma.user.findUnique({ where: { email: record.email } });
  if (!user) return { error: "Account not found." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { ok: true };
}
