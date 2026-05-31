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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">MindCloud</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {isLogin ? "Welcome back." : "Create your private journal."}
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input
            id="email" name="email" type="email" autoComplete="email" required
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input
            id="password" name="password" type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={6} required
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit" disabled={pending}
          className="w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-60"
        >
          {pending ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        {isLogin ? (
          <>No account?{" "}<Link href="/signup" className="text-sky-600 hover:underline">Sign up</Link></>
        ) : (
          <>Already have an account?{" "}<Link href="/login" className="text-sky-600 hover:underline">Sign in</Link></>
        )}
      </p>
    </div>
  );
}
