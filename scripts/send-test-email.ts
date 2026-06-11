/**
 * Send a test email to verify Resend is configured.
 *   node --env-file=.env --import tsx scripts/send-test-email.ts you@example.com
 * Requires RESEND_API_KEY in .env.
 */
import { Resend } from "resend";

async function main() {
  const to = process.argv[2];
  if (!to) throw new Error("Usage: send-test-email.ts <recipient@example.com>");

  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Set RESEND_API_KEY in .env");

  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: "MindCloud <hello@mindcloud.space>",
    to,
    subject: "MindCloud test email",
    html: "<p>If you can read this, Resend is wired up correctly.</p>",
  });

  if (error) throw new Error(JSON.stringify(error));
  console.log(`✓ sent to ${to} (id: ${data?.id})`);
}

main().catch((e) => {
  console.error("✗", e instanceof Error ? e.message : e);
  process.exit(1);
});
