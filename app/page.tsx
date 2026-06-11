import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import { Logo } from "@/components/logo";
import { SocialIcons } from "@/components/social-icons";

// Always render fresh so a redeploy is reflected immediately (no ISR window).
export const dynamic = "force-dynamic";

const features = [
  {
    emoji: "📓",
    title: "Journal",
    body: "Write freely. No audience, no likes, no pressure — just you and the page.",
    preview: "Today I realised I've been carrying a lot of tension about work, and writing it down already helps…",
  },
  {
    emoji: "🙏",
    title: "Gratitude",
    body: "Three good things a day. A gentle habit that takes thirty seconds.",
    preview: "○ Morning coffee in the sun\n○ A good conversation\n○ Finally shipped the thing",
  },
  {
    emoji: "📊",
    title: "Weekly reflection",
    body: "A warm, AI-written summary of your week's mood and recurring themes.",
    preview: "This week you showed up consistently, even on the harder days. Your mood lifted toward the weekend…",
  },
];

const trust = [
  { title: "No ads.", body: "You are not the product." },
  { title: "Never trained on.", body: "Your entries stay yours." },
  { title: "Encrypted in transit.", body: "HTTPS everywhere, always." },
];

export default function Home() {
  return (
    <div className="w-full">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-sky-100/70 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-auto" />
            <span className="text-sm font-semibold tracking-tight">MindCloud</span>
          </div>
          <Link href="/login" className="text-sm font-medium text-sky-600 hover:underline">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="mx-auto max-w-2xl px-6 pb-14 pt-12 text-center sm:pt-16">
        <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300">
          Invite-only · Join the waitlist
        </span>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Check in with{" "}
          <span className="text-sky-600">yourself.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-neutral-500">
          A private journal, gratitude log, and weekly AI reflections — built for clarity, not clout.
        </p>
        <div className="mx-auto mt-7 max-w-md">
          <WaitlistForm />
        </div>
        <p className="mt-3 text-xs text-neutral-400">
          Private by design · Your words stay yours.
        </p>
      </header>

      {/* Features */}
      <section className="border-t border-sky-100/70 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">What&apos;s inside</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Three habits. One calm space.
          </h2>
          <p className="mt-2 max-w-md text-sm text-neutral-500">
            Everything you need to check in with yourself daily — nothing you don&apos;t.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card-soft flex flex-col gap-3 text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-xl dark:bg-sky-950/50">
                  {f.emoji}
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="text-sm text-neutral-500">{f.body}</p>
                <p className="mt-auto whitespace-pre-line rounded-xl border border-sky-100 bg-white/60 p-3 text-xs leading-relaxed text-neutral-400 dark:border-slate-800 dark:bg-slate-900/40">
                  {f.preview}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy / trust */}
      <section className="border-t border-sky-100/70 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Privacy</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Private by design. Your words stay yours.
          </h2>
          <p className="mt-2 max-w-lg text-sm text-neutral-500">
            Your journal is not a product. It is never used to train AI, never sold, and never shared.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {trust.map((t) => (
              <div key={t.title} className="rounded-2xl bg-sky-50/60 p-5 dark:bg-slate-900/40">
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="mt-1 text-xs text-neutral-500">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="border-t border-sky-100/70 dark:border-slate-800">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Our story</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Why we built this.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-500">
            MindCloud started as a personal macOS app — a quiet place to write without noise or an
            audience. It grew into a daily habit for journaling, gratitude, and weekly reflection.
            We kept it invite-only because this isn&apos;t a social network. It&apos;s a private
            space, and we want it to stay that way.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sky-100/70 dark:border-slate-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-auto" />
            <span className="text-sm font-medium">MindCloud</span>
          </div>
          <p className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
            Designed with Love in Puglia
            <svg viewBox="0 0 24 24" width="13" height="13" fill="#f43f5e" aria-label="love">
              <path d="M12 21s-6.7-4.35-9.33-8.07C.9 10.36 1.4 6.9 4.06 5.6c2-1 4.2-.3 5.4 1.4L12 9.9l2.54-2.9c1.2-1.7 3.4-2.4 5.4-1.4 2.66 1.3 3.16 4.76 1.39 7.33C18.7 16.65 12 21 12 21Z" />
            </svg>
          </p>
          <SocialIcons />
        </div>
      </footer>
    </div>
  );
}
