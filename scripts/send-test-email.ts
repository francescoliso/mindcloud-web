/**
 * Send a test email to verify Gmail SMTP is configured.
 *   node --env-file=.env --import tsx scripts/send-test-email.ts you@example.com
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD in .env.
 */
import nodemailer from "nodemailer";

async function main() {
  const to = process.argv[2];
  if (!to) throw new Error("Usage: send-test-email.ts <recipient@example.com>");

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) throw new Error("Set GMAIL_USER and GMAIL_APP_PASSWORD in .env");

  const from = process.env.EMAIL_FROM || `MindCloud <${user}>`;
  const transport = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });

  const info = await transport.sendMail({
    from,
    to,
    subject: "MindCloud test email 🌤️",
    html: "<p>If you can read this, Gmail SMTP is wired up correctly.</p>",
  });
  console.log(`✓ sent from "${from}" to ${to} (id: ${info.messageId})`);
}

main().catch((e) => {
  console.error("✗", e instanceof Error ? e.message : e);
  process.exit(1);
});
