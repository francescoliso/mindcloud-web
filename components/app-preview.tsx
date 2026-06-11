import { Logo } from "@/components/logo";

// A stylized preview of the MindCloud app — stands in for a real screenshot
// in the hero. Pure markup so it stays crisp at any size and theme-adapts.
export function AppPreview({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-[0_20px_60px_-20px_rgba(2,132,199,0.25)] dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-sky-100 px-4 py-3 dark:border-slate-800">
        <span className="h-3 w-3 rounded-full bg-rose-300" />
        <span className="h-3 w-3 rounded-full bg-amber-300" />
        <span className="h-3 w-3 rounded-full bg-emerald-300" />
        <div className="ml-2 flex items-center gap-1.5">
          <Logo className="h-4 w-auto" />
          <span className="text-xs font-medium text-neutral-500">MindCloud</span>
        </div>
      </div>

      {/* body */}
      <div className="space-y-4 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          Tuesday, 11 June
        </p>

        {/* journal entry */}
        <div className="rounded-2xl bg-sky-50/70 p-4 dark:bg-slate-800/50">
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            Today I realised I&apos;ve been carrying a lot of tension about work. Writing it
            down already makes it feel lighter — like I can finally see the shape of it.
          </p>
        </div>

        {/* mood check-in */}
        <div className="flex items-center justify-between rounded-2xl border border-sky-100 px-4 py-3 dark:border-slate-800">
          <span className="text-sm text-neutral-500">How are you today?</span>
          <div className="flex gap-1.5">
            {["😔", "😕", "😐", "🙂", "😄"].map((face, i) => (
              <span
                key={face}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                  i === 3
                    ? "bg-sky-500 ring-2 ring-sky-200 dark:ring-sky-900"
                    : "bg-sky-50 dark:bg-slate-800"
                }`}
              >
                {face}
              </span>
            ))}
          </div>
        </div>

        {/* weekly reflection */}
        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-violet-50 p-4 dark:from-slate-800/60 dark:to-slate-800/30">
          <p className="text-xs font-medium text-sky-700 dark:text-sky-300">
            ✨ This week&apos;s reflection
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            You showed up consistently, even on the harder days. Your mood lifted toward the
            weekend as you made more time for yourself.
          </p>
        </div>
      </div>
    </div>
  );
}
