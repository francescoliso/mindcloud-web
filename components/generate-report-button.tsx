"use client";

import { useActionState } from "react";
import { generateReport, type ReportState } from "@/actions/reports";

export function GenerateReportButton() {
  const [state, action, pending] = useActionState<ReportState, FormData>(generateReport, {});

  return (
    <form action={action} className="shrink-0 text-right">
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-60"
      >
        {pending ? "Generating…" : "Generate this week"}
      </button>
      {state.error && <p className="mt-1 max-w-xs text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
