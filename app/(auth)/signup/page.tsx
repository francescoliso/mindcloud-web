import Link from "next/link";
import { prisma } from "@/lib/db";
import { SignupForm } from "@/components/signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  // No token: invite-only notice + a form (the action lets the admin bootstrap).
  if (!token) return <SignupForm />;

  const entry = await prisma.waitlistEntry.findUnique({ where: { inviteToken: token } });
  const valid =
    !!entry &&
    entry.status !== "REGISTERED" &&
    (!entry.tokenExpiresAt || entry.tokenExpiresAt >= new Date());

  if (!valid) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Invite link invalid</h1>
        <p className="mt-2 text-sm text-neutral-500">
          This invite link is invalid or has already been used.
        </p>
        <Link href="/" className="mt-4 text-sm text-sky-600 hover:underline">
          Join the waitlist
        </Link>
      </div>
    );
  }

  return <SignupForm token={token} email={entry!.email} invited />;
}
