"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword, type ResetState } from "@/actions/password-reset";
import { Logo } from "@/components/logo";
import { Suspense } from "react";

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword, {});

  if (state.ok) {
    return (
      <div className="mt-6 space-y-4">
        <div className="rounded-xl bg-sky-50 p-4 text-sm text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
          Password updated. You can now sign in with your new password.
        </div>
        <Link href="/login" className="btn-soft block w-full text-center">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-3 text-left">
      <input type="hidden" name="token" value={token} />
      <input
        name="password" type="password" required autoComplete="new-password"
        minLength={6} aria-label="New password" placeholder="New password"
        className="input-soft"
      />
      <input
        name="confirm" type="password" required autoComplete="new-password"
        minLength={6} aria-label="Confirm password" placeholder="Confirm password"
        className="input-soft"
      />
      {state.error && <p className="px-1 text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-soft w-full">
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-6">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-sky-900/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="card-soft text-center">
          <Logo className="mx-auto mb-3 h-14 w-auto" />
          <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
          <p className="mt-1 text-sm text-neutral-500">Choose something you haven&apos;t used before.</p>
          <Suspense>
            <ResetForm />
          </Suspense>
          <p className="mt-5 text-sm text-neutral-400">
            <Link href="/login" className="font-medium text-sky-400 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
