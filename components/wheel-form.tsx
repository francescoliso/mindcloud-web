"use client";

import { useActionState, useState } from "react";
import { DIMENSIONS, type Goals, type Current } from "@/lib/dimensions";
import { WheelChart } from "@/components/wheel-chart";
import { saveLifeWheel } from "@/actions/wheel";

export function WheelForm({
  goals,
  current,
  isNew,
}: {
  goals: Goals;
  current: Current;
  isNew: boolean;
}) {
  const [, action, pending] = useActionState(saveLifeWheel, null);
  const [editing, setEditing] = useState(isNew);

  // Live preview state
  const [liveGoals, setLiveGoals]     = useState<Goals>(goals);
  const [liveCurrent, setLiveCurrent] = useState<Current>(current);

  function setGoal(key: string, val: number) {
    setLiveGoals((g) => ({ ...g, [key]: val }));
  }
  function setScore(key: string, val: number) {
    setLiveCurrent((c) => ({ ...c, [key]: { ...c[key as keyof Current], score: val } }));
  }
  function setComment(key: string, val: string) {
    setLiveCurrent((c) => ({ ...c, [key]: { ...c[key as keyof Current], comment: val } }));
  }

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {DIMENSIONS.map((d) => {
            const c = current[d.key];
            return (
              <div key={d.key} className="card-soft space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{d.label}</span>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="text-sky-500 font-medium">{c.score}/10</span>
                    <span>→</span>
                    <span className="text-sky-300">{goals[d.key]}/10 goal</span>
                  </div>
                </div>
                {c.comment && (
                  <p className="text-sm text-neutral-500 leading-relaxed">{c.comment}</p>
                )}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="btn-soft w-full"
        >
          Update
        </button>
      </div>
    );
  }

  return (
    <form action={action} onSubmit={() => setEditing(false)} className="space-y-6">
      {/* Live chart preview while editing */}
      <WheelChart goals={liveGoals} current={liveCurrent} />

      <div className="grid gap-4 sm:grid-cols-2">
        {DIMENSIONS.map((d) => (
          <div key={d.key} className="card-soft space-y-3">
            <p className="text-sm font-semibold">{d.label}</p>

            <div className="flex gap-4">
              <label className="flex-1 space-y-1">
                <span className="text-xs text-neutral-500">Goal</span>
                <input
                  type="number" name={`goal_${d.key}`}
                  min={1} max={10} required
                  value={liveGoals[d.key]}
                  onChange={(e) => setGoal(d.key, Number(e.target.value))}
                  className="input-soft text-center"
                />
              </label>
              <label className="flex-1 space-y-1">
                <span className="text-xs text-neutral-500">Now</span>
                <input
                  type="number" name={`score_${d.key}`}
                  min={1} max={10} required
                  value={liveCurrent[d.key].score}
                  onChange={(e) => setScore(d.key, Number(e.target.value))}
                  className="input-soft text-center"
                />
              </label>
            </div>

            <textarea
              name={`comment_${d.key}`}
              placeholder="A note on this dimension…"
              rows={2}
              value={liveCurrent[d.key].comment}
              onChange={(e) => setComment(d.key, e.target.value)}
              className="input-soft resize-none text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {!isNew && (
          <button
            type="button"
            onClick={() => { setLiveGoals(goals); setLiveCurrent(current); setEditing(false); }}
            className="flex-1 rounded-2xl border border-sky-100 py-2.5 text-sm font-medium text-neutral-500 transition hover:border-sky-300 dark:border-slate-700"
          >
            Cancel
          </button>
        )}
        <button type="submit" disabled={pending} className="btn-soft flex-1">
          {pending ? "Saving…" : isNew ? "Create my Life Wheel" : "Save"}
        </button>
      </div>
    </form>
  );
}
