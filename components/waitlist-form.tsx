"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/actions/waitlist";

export function WaitlistForm() {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, {});

  if (state.ok) {
    return (
      <p className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="flex w-full flex-col gap-2 sm:flex-row">
      <input
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        aria-label="Email address"
        className="input-soft flex-1"
      />
      <button
        type="submit"
        disabled={pending}
        className="btn-soft"
      >
        {pending ? "Joining…" : "Join the waitlist"}
      </button>
      {state.error && <p className="text-sm text-red-600 sm:basis-full">{state.error}</p>}
    </form>
  );
}
