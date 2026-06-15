import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { DIMENSIONS, type Goals, type Current } from "@/lib/dimensions";
import { WheelChart } from "@/components/wheel-chart";
import { WheelForm } from "@/components/wheel-form";

export default async function WheelPage() {
  const userId = await requireUserId();
  const wheel  = await prisma.lifeWheel.findUnique({ where: { userId } });

  const goals: Goals = (wheel?.goals as Goals) ?? Object.fromEntries(
    DIMENSIONS.map((d) => [d.key, 5])
  ) as Goals;

  const current: Current = (wheel?.current as Current) ?? Object.fromEntries(
    DIMENSIONS.map((d) => [d.key, { score: 5, comment: "" }])
  ) as Current;

  const isNew = !wheel;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Life Wheel</h1>
        <p className="text-sm text-neutral-500">
          {isNew
            ? "Set your goals and where you are today across the key dimensions of your life."
            : "A snapshot of where you want to be and where you are now."}
        </p>
      </div>

      {!isNew && (
        <WheelChart goals={goals} current={current} />
      )}

      <WheelForm goals={goals} current={current} isNew={isNew} />
    </div>
  );
}
