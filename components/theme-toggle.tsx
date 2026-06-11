"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Reflect whatever theme the no-flash inline script already applied.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function set(next: Theme) {
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <div className="inline-flex rounded-full bg-sky-50 p-1 dark:bg-sky-950/40">
      {(["light", "dark"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => set(t)}
          aria-pressed={theme === t}
          className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
            theme === t
              ? "bg-white text-sky-700 shadow-sm dark:bg-neutral-800 dark:text-sky-300"
              : "text-neutral-500 hover:text-sky-700 dark:hover:text-sky-200"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
