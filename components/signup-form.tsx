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
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <div className="card-soft text-center">
        <Logo className="mx-auto mb-3 h-14 w-auto" />
        <h1 className="text-2xl font-semibold tracking-tight">MindCloud</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {invited ? "You're invited — create your account." : "Create your account"}
        </p>

        <form action={action} className="mt-6 space-y-3 text-left">
          {token && <input type="hidden" name="token" value={token} />}

          <div className="grid grid-cols-2 gap-3">
            <input
              id="firstName" name="firstName" type="text"
              autoComplete="given-name" required
              aria-label="First name" placeholder="First name"
              className="input-soft"
            />
            <input
              id="lastName" name="lastName" type="text"
              autoComplete="family-name" required
              aria-label="Last name" placeholder="Last name"
              className="input-soft"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="dateOfBirth" className="px-1 text-xs text-neutral-500">
              Date of birth
            </label>
            <input
              id="dateOfBirth" name="dateOfBirth" type="date"
              autoComplete="bday" required
              aria-label="Date of birth"
              className="input-soft"
            />
          </div>

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
              MindCloud is invite-only. If you have an invite link, open that instead.
            </p>
          )}

          {state.error && <p className="px-1 text-sm text-red-600">{state.error}</p>}

          <button type="submit" disabled={pending} className="btn-soft w-full">
            {pending ? "Please wait…" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-sky-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
