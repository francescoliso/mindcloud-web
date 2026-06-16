"use client";

import { useActionState } from "react";
import { sendContactMessage, type ContactState } from "@/actions/contact";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, {});

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-sky-50/60 p-6 text-center dark:bg-slate-900/40">
        <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">Message sent!</p>
        <p className="mt-1 text-sm text-neutral-500">We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name" type="text" required maxLength={100}
          aria-label="Your name" placeholder="Your name"
          className="input-soft"
        />
        <input
          name="email" type="email" required
          aria-label="Your email" placeholder="your@email.com"
          className="input-soft"
        />
      </div>
      <textarea
        name="message" required minLength={10} maxLength={2000} rows={4}
        aria-label="Message" placeholder="What's on your mind?"
        className="input-soft resize-none"
      />
      {state.error && <p className="px-1 text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-soft">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
