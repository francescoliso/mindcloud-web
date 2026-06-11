"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function JournalSearch({
  initialQuery,
  activeTag,
}: {
  initialQuery: string;
  activeTag?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (activeTag) params.set("tag", activeTag);
    router.push(`/journal${params.toString() ? `?${params}` : ""}`);
  }

  const hasFilter = !!q.trim() || !!activeTag;

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search your entries…"
        aria-label="Search entries"
        className="input-soft flex-1"
      />
      {activeTag && (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
          #{activeTag}
        </span>
      )}
      <button type="submit" className="btn-soft">
        Search
      </button>
      {hasFilter && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.push("/journal");
          }}
          className="text-sm font-medium text-neutral-500 hover:text-sky-600"
        >
          Clear
        </button>
      )}
    </form>
  );
}
