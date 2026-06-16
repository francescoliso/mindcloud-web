"use client";

import { useActionState } from "react";
import { sendFeedback, type FeedbackState } from "@/actions/feedback";

export function FeedbackForm() {
  const [state, action, pending] = useActionState<FeedbackState, FormData>(sendFeedback, {});

  if (state.ok) {
    return (
      <div className="rounded-xl bg-sky-50 p-4 text-sm text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
        Thanks for the feedback — it really helps.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <textarea
        name="message" required minLength={10} maxLength={2000} rows={4}
        aria-label="Feedback" placeholder="Share an idea, report a problem, or just say hi…"
        className="input-soft resize-none"
      />
      {state.error && <p className="px-1 text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-soft">
        {pending ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
