"use server";

import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export type ContactState = { error?: string; ok?: boolean };

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  if (!(await rateLimit(`contact:${await clientIp()}`, 3, 3600))) {
    return { error: "Too many messages. Please try again later." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || name.length > 100) return { error: "Please enter your name." };
  if (!z.string().email().safeParse(email).success) return { error: "Enter a valid email address." };
  if (!message || message.length < 10) return { error: "Please write a message." };
  if (message.length > 2000) return { error: "Message must be under 2000 characters." };

  await sendContactEmail({ name, email, message });
  return { ok: true };
}
