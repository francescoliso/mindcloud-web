"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteAccount } from "@/actions/account";

function ConfirmButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Permanently delete my account"}
    </button>
  );
}

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30"
      >
        Delete account
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
      <p className="text-sm text-rose-700 dark:text-rose-300">
        This permanently deletes your account and every entry — journal, gratitude, moods, and
        reports. This cannot be undone.
      </p>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        Type <span className="font-semibold">DELETE</span> to confirm:
      </p>
      <input
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="DELETE"
        className="input-soft max-w-[200px]"
        aria-label="Type DELETE to confirm"
      />
      <div className="flex items-center gap-3">
        <form action={deleteAccount}>
          <ConfirmButton disabled={confirm !== "DELETE"} />
        </form>
        <button
          onClick={() => {
            setOpen(false);
            setConfirm("");
          }}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
