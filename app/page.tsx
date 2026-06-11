import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import { Logo } from "@/components/logo";

// Always render fresh so a redeploy is reflected immediately (no ISR window).
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <header className="text-center">
        <Logo className="mx-auto mb-4 h-16 w-auto" />
        <h1 className="text-4xl font-semibold tracking-tight">MindCloud</h1>
        <p className="mx-auto mt-3 max-w-md text-base text-neutral-500">
          A private, calm space for journaling, gratitude, and weekly reflections on how you&apos;re really doing.
        </p>
      </header>

      <section className="mt-10 space-y-3">
        <p className="text-center text-sm font-medium text-neutral-500">
          MindCloud is invite-only right now. Join the waitlist:
        </p>
        <WaitlistForm />
        <p className="text-center text-xs text-neutral-400">
          Private by design · Your words stay yours.
        </p>
        <p className="text-center text-xs text-neutral-400">
          Already invited?{" "}
          <Link href="/login" className="text-sky-600 hover:underline">
            Sign in
          </Link>
        </p>
      </section>

      <footer className="mt-16 text-center text-xs text-neutral-400">
        Designed with Love in Puglia!
      </footer>
    </main>
  );
}
