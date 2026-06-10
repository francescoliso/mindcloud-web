"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthState } from "@/actions/auth";

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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">MindCloud</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {invited ? "You're invited — create your account." : "Create your account"}
        </p>
      </div>

      <form action={action} className="space-y-4">
        {token && <input type="hidden" name="token" value={token} />}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={email}
            readOnly={invited}
            autoComplete="email"
            className={`w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 ${invited ? "opacity-70" : ""}`}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
          />
        </div>

        {!invited && (
          <p className="text-xs text-neutral-500">
            MindCloud is invite-only. If you have an invite link, open that instead.
          </p>
        )}

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-60"
        >
          {pending ? "Please wait…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-sky-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
