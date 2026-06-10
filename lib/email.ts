import "server-only";
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "MindCloud <onboarding@resend.dev>";
const API_KEY = process.env.RESEND_API_KEY;

// Sends an email via Resend. If no API key is configured (local dev, or before
// email is set up), it logs the message instead of throwing — so the app keeps
// working and the invite link is still recoverable from the server logs.
async function send(to: string, subject: string, html: string): Promise<void> {
  if (!API_KEY) {
    console.log(`[email:dev] to=${to} subject="${subject}"\n${html}\n`);
    return;
  }
  try {
    const resend = new Resend(API_KEY);
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) console.error("[email] send failed:", error);
  } catch (err) {
    console.error("[email] send threw:", err);
  }
}

export async function sendWaitlistConfirmation(to: string): Promise<void> {
  await send(
    to,
    "You're on the MindCloud waitlist 🌤️",
    `<p>Thanks for joining the <strong>MindCloud</strong> waitlist.</p>
     <p>MindCloud is a private space for journaling, gratitude, and weekly reflections.
     We'll email you an invite when your spot opens up.</p>`,
  );
}

export async function sendInvite(to: string, link: string): Promise<void> {
  await send(
    to,
    "Your MindCloud invite is ready ✨",
    `<p>You're invited to <strong>MindCloud</strong>.</p>
     <p><a href="${link}">Create your account</a></p>
     <p>Or paste this link into your browser:<br>${link}</p>
     <p>This invite link expires in 30 days.</p>`,
  );
}
