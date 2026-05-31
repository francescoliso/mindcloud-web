"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { createJournalEntry } from "@/actions/journal";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save entry"}
    </button>
  );
}

export function JournalComposer() {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={async (formData) => {
        await createJournalEntry(formData);
        ref.current?.reset();
      }}
      className="space-y-2"
    >
      <textarea
        name="content"
        rows={4}
        required
        placeholder="What's on your mind today?"
        className="w-full resize-y rounded-xl border border-neutral-300 bg-transparent p-3 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
      />
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
