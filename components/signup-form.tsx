"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthState } from "@/actions/auth";
import { Logo } from "@/components/logo";

export function SignupForm({
  token,
  email,
  invited,
}: {
  token?: string;
  email?: string;
  invited?: boolean;
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signup, {});

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-50 px-6">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="card-soft text-center">
          <Logo className="mx-auto mb-3 h-14 w-auto" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {invited ? "You're invited" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {invited ? "Your private journal awaits." : "MindCloud is invite-only."}
          </p>

          <form action={action} className="mt-6 space-y-3 text-left">
            {token && <input type="hidden" name="token" value={token} />}

            <input
              id="email" name="email" type="email" required
              defaultValue={email} readOnly={invited} autoComplete="email"
              aria-label="Email" placeholder="you@example.com"
              className={`input-soft ${invited ? "opacity-70" : ""}`}
            />
            <input
              id="password" name="password" type="password"
              autoComplete="new-password" minLength={6} required
              aria-label="Password" placeholder="Choose a password"
              className="input-soft"
            />

            {!invited && (
              <p className="px-1 text-xs text-neutral-500">
                Have an invite link? Open that link directly to create your account.
              </p>
            )}

            {state.error && <p className="px-1 text-sm text-red-600">{state.error}</p>}

            <button type="submit" disabled={pending} className="btn-soft w-full">
              {pending ? "Please wait…" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-sm text-neutral-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-sky-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
