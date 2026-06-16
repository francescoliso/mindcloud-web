"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export type AuthState = { error?: string };

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!(await rateLimit(`login:${await clientIp()}`, 10, 600))) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirectTo: "/journal" });
    return {};
  } catch (err) {
    // signIn throws a redirect on success — that must propagate.
    if (err instanceof AuthError) return { error: "Invalid email or password." };
    throw err;
  }
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!(await rateLimit(`signup:${await clientIp()}`, 10, 600))) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }
  const password = String(formData.get("password") ?? "");
  const token = String(formData.get("token") ?? "").trim();
  let email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  // Invite-only: a valid invite token, or the configured admin email, is required.
  let invitedEntryId: string | null = null;
  if (token) {
    const entry = await prisma.waitlistEntry.findUnique({ where: { inviteToken: token } });
    const expired = entry?.tokenExpiresAt ? entry.tokenExpiresAt < new Date() : false;
    if (!entry || entry.status === "REGISTERED" || expired) {
      return { error: "This invite link is invalid or has expired." };
    }
    email = entry.email.toLowerCase(); // trust the invite, not the form
    invitedEntryId = entry.id;
  } else if (!isAdmin(email)) {
    return { error: "MindCloud is invite-only. Join the waitlist to request access." };
  }

  if (!z.string().email().safeParse(email).success) {
    return { error: "Enter a valid email address." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "This email cannot be used. It may already be registered." };

  const firstName   = String(formData.get("firstName")   ?? "").trim() || null;
  const lastName    = String(formData.get("lastName")    ?? "").trim() || null;
  const dobRaw      = String(formData.get("dateOfBirth") ?? "").trim();
  let dateOfBirth: Date | null = null;
  if (dobRaw) {
    const dob = new Date(dobRaw);
    const age = new Date().getFullYear() - dob.getFullYear();
    if (isNaN(dob.getTime()) || age < 13 || age > 120) {
      return { error: "Please enter a valid date of birth." };
    }
    dateOfBirth = dob;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, passwordHash, firstName, lastName, dateOfBirth } });
  if (invitedEntryId) {
    await prisma.waitlistEntry.update({ where: { id: invitedEntryId }, data: { status: "REGISTERED" } });
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/journal" });
    return {};
  } catch (err) {
    if (err instanceof AuthError) return { error: "Account created, but sign-in failed. Please log in." };
    throw err;
  }
}
