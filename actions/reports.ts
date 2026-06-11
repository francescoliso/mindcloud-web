"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/session";
import { generateWeeklyReport } from "@/lib/reports";

export type ReportState = { error?: string; ok?: boolean };

export async function generateReport(
  _prev: ReportState,
  _formData: FormData,
): Promise<ReportState> {
  const userId = await requireUserId();
  try {
    await generateWeeklyReport(userId);
    revalidatePath("/reports");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate report." };
  }
}
