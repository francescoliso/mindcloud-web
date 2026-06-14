"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthState } from "@/actions/auth";
import { Logo } from "@/components/logo";

type Action = (prev: AuthState, formData: FormData) => Promise<AuthState>;

export function AuthForm({ mode, action }: { mode: "login" | "signup"; action: Action }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-6">
      {/* Soft glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-sky-900/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="mb-4 flex items-center gap-1.5 text-sm text-neutral-400 transition hover:text-sky-400"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 12L6 8l4-4" />
          </svg>
          Back to home
        </Link>

        <div className="card-soft text-center">
          <Logo className="mx-auto mb-3 h-14 w-auto" />
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-neutral-500">Sign in to your private space.</p>

          <form action={formAction} className="mt-6 space-y-3 text-left">
            <input
              id="email" name="email" type="email" autoComplete="email" required
              aria-label="Email" placeholder="you@example.com" className="input-soft"
            />
            <input
              id="password" name="password" type="password" autoComplete="current-password"
              minLength={6} required aria-label="Password" placeholder="Password"
              className="input-soft"
            />

            {state.error && <p className="px-1 text-sm text-red-600">{state.error}</p>}

            <button type="submit" disabled={pending} className="btn-soft w-full">
              {pending ? "Please wait…" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link href="/" className="font-medium text-sky-500 hover:underline">
              Join the waitlist
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
