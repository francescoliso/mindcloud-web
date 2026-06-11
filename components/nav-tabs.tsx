"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/journal", label: "Journal" },
  { href: "/gratitude", label: "Gratitude" },
  { href: "/reports", label: "Reports" },
];

export function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 rounded-full bg-sky-50 p-1 dark:bg-sky-950/40">
      {tabs.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex-1 rounded-full px-3 py-1.5 text-center text-sm font-medium transition ${
              active
                ? "bg-white text-sky-700 shadow-sm dark:bg-neutral-800 dark:text-sky-300"
                : "text-neutral-500 hover:text-sky-700 dark:hover:text-sky-200"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
