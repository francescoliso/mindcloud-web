"use server";

import { auth } from "@/auth";
import { sendFeedbackEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export type FeedbackState = { error?: string; ok?: boolean };

export async function sendFeedback(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const session = await auth();
  if (!session?.user?.email) return { error: "You must be signed in." };

  if (!(await rateLimit(`feedback:${await clientIp()}`, 5, 3600))) {
    return { error: "Too many messages. Please try again later." };
  }

  const message = String(formData.get("message") ?? "").trim();
  if (!message || message.length < 10) return { error: "Please write a message." };
  if (message.length > 2000) return { error: "Message must be under 2000 characters." };

  await sendFeedbackEmail({ userEmail: session.user.email, message });
  return { ok: true };
}
