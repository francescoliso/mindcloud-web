import "server-only";
import nodemailer from "nodemailer";

const USER = process.env.GMAIL_USER;
const PASS = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ""); // app passwords are shown with spaces
const FROM = process.env.EMAIL_FROM ?? (USER ? `MindCloud <${USER}>` : "MindCloud");

// Sends via Gmail SMTP (free, no domain needed). If credentials are missing
// (local dev, or before setup), it logs the message instead of throwing — so
// the app keeps working and invite links stay recoverable from the logs / the
// admin page's copyable link.
async function send(to: string, subject: string, html: string): Promise<void> {
  if (!USER || !PASS) {
    console.log(`[email:dev] to=${to} subject="${subject}"\n${html}\n`);
    return;
  }
  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: { user: USER, pass: PASS },
    });
    await transport.sendMail({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] send failed:", err);
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
