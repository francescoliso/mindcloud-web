"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthState } from "@/actions/auth";

type Action = (prev: AuthState, formData: FormData) => Promise<AuthState>;

export function AuthForm({ mode, action }: { mode: "login" | "signup"; action: Action }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});
  const isLogin = mode === "login";

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <div className="card-soft text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-3xl dark:bg-sky-950">
          🌤️
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">MindCloud</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {isLogin ? "Welcome back." : "Create your private journal."}
        </p>

        <form action={formAction} className="mt-6 space-y-3 text-left">
          <input
            id="email" name="email" type="email" autoComplete="email" required
            aria-label="Email" placeholder="you@example.com" className="input-soft"
          />
          <input
            id="password" name="password" type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={6} required aria-label="Password" placeholder="Password"
            className="input-soft"
          />

          {state.error && <p className="px-1 text-sm text-red-600">{state.error}</p>}

          <button type="submit" disabled={pending} className="btn-soft w-full">
            {pending ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-neutral-500">
          {isLogin ? (
            <>New here?{" "}<Link href="/" className="font-medium text-sky-600 hover:underline">Join the waitlist</Link></>
          ) : (
            <>Already have an account?{" "}<Link href="/login" className="font-medium text-sky-600 hover:underline">Sign in</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
