import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { formatDateOnly } from "@/lib/format";
import { GenerateReportButton } from "@/components/generate-report-button";

export default async function ReportsPage() {
  const userId = await requireUserId();
  const reports = await prisma.weeklyReport.findMany({
    where: { userId },
    orderBy: { weekStart: "desc" },
  });

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Weekly Reports</h1>
          <p className="text-sm text-neutral-500">
            A warm AI reflection on your week&apos;s journal and gratitude.
          </p>
        </div>
        <GenerateReportButton />
      </section>

      {reports.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sky-200 p-6 text-center text-sm text-neutral-500 dark:border-sky-900">
          No reports yet. Generate one to reflect on your week.
        </p>
      ) : (
        reports.map((report) => (
          <article
            key={report.id}
            className="card-soft"
          >
            <p className="mb-2 text-xs font-medium text-neutral-500">
              Week of {formatDateOnly(report.weekStart)}
            </p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{report.content}</div>
          </article>
        ))
      )}
    </div>
  );
}
