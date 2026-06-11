import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { localDateOnlyUTC } from "@/lib/week";
import { finishOnboarding } from "@/actions/onboarding";
import { Logo } from "@/components/logo";

export default async function WelcomePage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardedAt: true },
  });
  if (user?.onboardedAt) redirect("/journal");

  const today = localDateOnlyUTC();
  const [mood, gratitudeCount, journalCount] = await Promise.all([
    prisma.moodEntry.findUnique({ where: { userId_entryDate: { userId, entryDate: today } } }),
    prisma.gratitudeItem.count({ where: { userId, entryDate: today } }),
    prisma.journalEntry.count({ where: { userId } }),
  ]);

  const steps = [
    { done: !!mood, label: "Set today's mood", hint: "A quick tap at the top of Journal.", href: "/journal" },
    { done: gratitudeCount >= 3, label: "Add three gratitudes", hint: "Three good things from today.", href: "/gratitude" },
    { done: journalCount > 0, label: "Write a journal entry", hint: "Whatever's on your mind.", href: "/journal" },
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <Logo className="mx-auto h-14 w-auto" />
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Welcome to MindCloud</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
          A calm, private place to check in with yourself. Here&apos;s the gentle daily rhythm — try one now, or dive in anytime.
        </p>
      </div>

      <ul className="space-y-3">
        {steps.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className="card-soft flex items-start gap-3 transition hover:border-sky-300"
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                  s.done
                    ? "bg-green-500 text-white"
                    : "border border-neutral-300 text-transparent dark:border-neutral-600"
                }`}
              >
                ✓
              </span>
              <span>
                <span className="block text-sm font-medium">{s.label}</span>
                <span className="block text-xs text-neutral-500">{s.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <form action={finishOnboarding} className="mt-8">
        <button className="btn-soft w-full">Start journaling</button>
      </form>
    </main>
  );
}
