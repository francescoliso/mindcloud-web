// Footer social icons. Links intentionally left as placeholders ("#") —
// swap the href values in once the accounts are live.
const SOCIALS = [
  { name: "Instagram", href: "#" },
  { name: "X", href: "#" },
] as const;

function Icon({ name }: { name: string }) {
  if (name === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  // X / Twitter
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

export function SocialIcons() {
  return (
    <div className="flex items-center gap-3">
      {SOCIALS.map((s) => (
        <a
          key={s.name}
          href={s.href}
          aria-label={s.name}
          className="text-neutral-400 transition-colors hover:text-sky-600"
        >
          <Icon name={s.name} />
        </a>
      ))}
    </div>
  );
}
