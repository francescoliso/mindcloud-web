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
        className="btn-soft"
      >
        {pending ? "Generating…" : "Generate this week"}
      </button>
      {state.error && <p className="mt-1 max-w-xs text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
