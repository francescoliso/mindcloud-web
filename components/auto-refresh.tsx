"use client";

import { useEffect, useRef } from "react";

// Polls /api/version and reloads the page when the deployed build changes,
// so a standalone Dock web app picks up new Vercel deploys without a manual
// reload. Also re-checks whenever the window regains focus (e.g. relaunch).
export function AutoRefresh({ intervalMs = 30000 }: { intervalMs?: number }) {
  const seen = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const { id } = (await res.json()) as { id?: string };
        if (!id || cancelled) return;

        if (seen.current === null) {
          seen.current = id;
        } else if (seen.current !== id) {
          window.location.reload();
        }
      } catch {
        // offline or transient — ignore and try again next tick
      }
    }

    check();
    const timer = setInterval(check, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);

  return null;
}
