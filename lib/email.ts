import "server-only";
import { Resend } from "resend";

const FROM = "MindCloud <hello@mindcloud.space>";
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// If no API key (local dev / not yet configured), logs instead of throwing so
// invite links remain recoverable from server logs and the admin UI copy button.
async function send(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    console.log(`[email:dev] to=${to} subject="${subject}"\n${html}\n`);
    return;
  }
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) console.error("[email] send failed:", error);
}

export async function sendWaitlistConfirmation(to: string): Promise<void> {
  await send(
    to,
    "You're on the MindCloud waitlist",
    `<p>Thanks for joining the <strong>MindCloud</strong> waitlist.</p>
     <p>MindCloud is a private space for journaling, gratitude, and weekly reflections.
     We'll email you an invite when your spot opens up.</p>
     <p style="color:#6b7280;font-size:13px">mindcloud.space · Private by design · Your words stay yours.</p>`,
  );
}

export async function sendInvite(to: string, link: string): Promise<void> {
  await send(
    to,
    "Your MindCloud invite is ready",
    `<p>You're invited to <strong>MindCloud</strong> — a private space for journaling, gratitude, and weekly reflections.</p>
     <p><a href="${link}" style="display:inline-block;padding:10px 20px;background:#0284c7;color:#fff;border-radius:8px;text-decoration:none">Create your account</a></p>
     <p style="color:#6b7280;font-size:13px">Or paste this link:<br>${link}</p>
     <p style="color:#6b7280;font-size:13px">This invite expires in 30 days.</p>
     <p style="color:#6b7280;font-size:13px">mindcloud.space · Private by design · Your words stay yours.</p>`,
  );
}

export async function sendAccountDeleted(to: string): Promise<void> {
  await send(
    to,
    "Your MindCloud account has been deleted",
    `<p>Your <strong>MindCloud</strong> account and all of its data — journal entries,
     gratitude, moods, and weekly reflections — have been permanently deleted.</p>
     <p>There's nothing left to do; this is just a confirmation. If this wasn't you,
     please reply to this email right away.</p>
     <p>Thank you for spending time with MindCloud. You're welcome back anytime.</p>
     <p style="color:#6b7280;font-size:13px">mindcloud.space · Private by design · Your words stay yours.</p>`,
  );
}
