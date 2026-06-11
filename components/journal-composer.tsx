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
      className="btn-soft"
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
        className="w-full resize-y rounded-2xl border border-sky-200 bg-white/70 p-3.5 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-sky-900 dark:bg-neutral-900 dark:focus:ring-sky-950"
      />
      <div className="flex items-center gap-2">
        <input
          name="tags"
          placeholder="tags, comma separated (optional)"
          className="input-soft flex-1"
        />
        <SubmitButton />
      </div>
    </form>
  );
}
