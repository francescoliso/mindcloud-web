"use client";

import { useState, useTransition } from "react";
import { setMood } from "@/actions/mood";
import { MOODS } from "@/lib/mood";

export function MoodCheckin({ initial }: { initial: number | null }) {
  const [selected, setSelected] = useState<number | null>(initial);
  const [pending, startTransition] = useTransition();

  function choose(score: number) {
    setSelected(score);
    startTransition(() => setMood(score));
  }

  return (
    <section className="card-soft">
      <p className="mb-3 text-sm font-medium">How are you feeling today?</p>
      <div className="flex justify-between gap-1.5">
        {MOODS.map((m) => {
          const active = selected === m.score;
          return (
            <button
              key={m.score}
              type="button"
              onClick={() => choose(m.score)}
              disabled={pending}
              aria-pressed={active}
              aria-label={m.label}
              title={m.label}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 transition disabled:opacity-60 ${
                active
                  ? "bg-sky-100 ring-2 ring-sky-400 dark:bg-sky-950"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
            >
              <span className="text-2xl leading-none">{m.emoji}</span>
              <span className="text-[10px] font-medium text-neutral-500">{m.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
