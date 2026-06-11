"use client";

import { useActionState } from "react";
import { saveGratitude, type GratitudeState } from "@/actions/gratitude";

const prompts = [
  "Something that made you smile today…",
  "A person you're grateful for…",
  "A small moment worth celebrating…",
];

export function GratitudeForm() {
  const [state, action, pending] = useActionState<GratitudeState, FormData>(saveGratitude, {});

  return (
    <form action={action} className="space-y-4">
      {[1, 2, 3].map((pos, i) => (
        <div key={pos}>
          <label htmlFor={`item${pos}`} className="mb-1 block text-sm font-medium">
            Gratitude {pos}
          </label>
          <input
            id={`item${pos}`}
            name={`item${pos}`}
            required
            placeholder={prompts[i]}
            className="input-soft"
          />
        </div>
      ))}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <p className="text-xs text-neutral-500">
        Fill in all three to complete today&apos;s gratitude. You can do this once per day.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="btn-soft-pink w-full"
      >
        {pending ? "Saving…" : "Complete today's gratitude"}
      </button>
    </form>
  );
}
