import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { finishOnboarding } from "@/actions/onboarding";
import { Logo } from "@/components/logo";

const features = [
  {
    emoji: "📓",
    title: "Journal",
    body: "Write freely, whenever you need to. No audience, no likes — just you and the page. Add tags to find entries later.",
  },
  {
    emoji: "🙏",
    title: "Gratitude",
    body: "Three good things a day. A gentle habit that takes thirty seconds and shifts how you see the day.",
  },
  {
    emoji: "🕸️",
    title: "Life Wheel",
    body: "Set goals across eight dimensions of your life — work, love, health, and more — and track where you are today.",
  },
  {
    emoji: "📊",
    title: "Weekly reflection",
    body: "Every Monday, a warm AI-written summary of your week's mood, journal themes, and gratitude patterns.",
  },
];

export default async function WelcomePage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardedAt: true },
  });
  if (user?.onboardedAt) redirect("/journal");

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-10 text-center">
        <Logo className="mx-auto h-14 w-auto" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome to MindCloud
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
          A calm, private space to check in with yourself. Everything stays yours.
        </p>
      </div>

      <ul className="space-y-3">
        {features.map((f) => (
          <li key={f.title} className="card-soft flex items-start gap-4">
            <span className="mt-0.5 text-2xl leading-none">{f.emoji}</span>
            <span>
              <span className="block text-sm font-semibold">{f.title}</span>
              <span className="mt-0.5 block text-sm leading-relaxed text-neutral-500">{f.body}</span>
            </span>
          </li>
        ))}
      </ul>

      <form action={finishOnboarding} className="mt-8">
        <button className="btn-soft w-full">Get started</button>
      </form>
    </main>
  );
}
