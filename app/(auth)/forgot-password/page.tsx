"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ResetState } from "@/actions/password-reset";
import { Logo } from "@/components/logo";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<ResetState, FormData>(requestPasswordReset, {});

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-6">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-sky-900/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="card-soft text-center">
          <Logo className="mx-auto mb-3 h-14 w-auto" />
          <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {state.ok ? (
            <div className="mt-6 rounded-xl bg-sky-50 p-4 text-sm text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
              If that email is registered, a reset link is on its way. Check your inbox.
            </div>
          ) : (
            <form action={action} className="mt-6 space-y-3 text-left">
              <input
                name="email" type="email" required autoComplete="email"
                aria-label="Email" placeholder="you@example.com"
                className="input-soft"
              />
              {state.error && <p className="px-1 text-sm text-red-600">{state.error}</p>}
              <button type="submit" disabled={pending} className="btn-soft w-full">
                {pending ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

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
