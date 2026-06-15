import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import { Logo } from "@/components/logo";
import { SocialIcons } from "@/components/social-icons";
import { AppPreview } from "@/components/app-preview";

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
    emoji: "🕸️",
    title: "Life Wheel",
    body: "Set goals across eight dimensions of your life and see where you stand today.",
    preview: "Work 6→9 · Love 7→9 · Health 5→8\nFriendship 7→8 · Finance 4→7…",
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
    <div className="h-screen snap-y snap-mandatory overflow-y-scroll scroll-smooth">
      {/* Nav */}
      <nav className="sticky top-0 z-20 border-b border-sky-100/70 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/60">
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
      <section className="flex min-h-screen snap-start items-center px-6">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 py-12 lg:grid-cols-2">
          {/* left: copy + form */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300">
              Invite-only · Join the waitlist
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Check in with <span className="text-sky-600">yourself.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-lg text-neutral-500 lg:mx-0">
              A private journal, gratitude log, and weekly AI reflections — built for clarity, not clout.
            </p>
            <div className="mx-auto mt-8 w-full max-w-md lg:mx-0">
              <WaitlistForm />
            </div>
            <p className="mt-3 text-xs text-neutral-400">
              Private by design · Your words stay yours.
            </p>
          </div>

          {/* right: app preview */}
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <AppPreview />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="flex min-h-screen snap-start items-center border-t border-sky-100/70 px-6 dark:border-slate-800">
        <div className="mx-auto w-full max-w-5xl py-16">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">What&apos;s inside</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p className="mt-2 max-w-md text-sm text-neutral-500">
            Four tools to check in with yourself — daily and over time.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      <section className="flex min-h-screen snap-start items-center border-t border-sky-100/70 px-6 dark:border-slate-800">
        <div className="mx-auto w-full max-w-5xl py-16">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Privacy</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
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

      {/* Story + footer (last screen) */}
      <section className="flex min-h-screen snap-start flex-col border-t border-sky-100/70 dark:border-slate-800">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Our story</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Why we built this.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-500">
            MindCloud started as a personal macOS app — a quiet place to write without noise or an
            audience. It grew into a daily habit for journaling, gratitude, and weekly reflection.
            We kept it invite-only because this isn&apos;t a social network. It&apos;s a private
            space, and we want it to stay that way.
          </p>
        </div>

        <footer className="border-t border-sky-100/70 dark:border-slate-800">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
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
      </section>
    </div>
  );
}
