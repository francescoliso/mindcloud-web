/**
 * Send a test email to verify Resend is configured.
 *   node --env-file=.env --import tsx scripts/send-test-email.ts you@example.com
 * Requires RESEND_API_KEY (and ideally EMAIL_FROM) in .env.
 */
import { Resend } from "resend";

async function main() {
  const to = process.argv[2];
  if (!to) throw new Error("Usage: send-test-email.ts <recipient@example.com>");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set in .env");

  const from = process.env.EMAIL_FROM ?? "MindCloud <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "MindCloud test email 🌤️",
    html: "<p>If you can read this, Resend is wired up correctly.</p>",
  });

  if (error) {
    console.error("✗ send failed:", error);
    process.exit(1);
  }
  console.log(`✓ sent from "${from}" to ${to} (id: ${data?.id})`);
}

main().catch((e) => {
  console.error("✗", e instanceof Error ? e.message : e);
  process.exit(1);
});
