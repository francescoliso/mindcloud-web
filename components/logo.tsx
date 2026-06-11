type LogoProps = {
  className?: string;
  title?: string;
};

// MindCloud "Moodmind" mark — two brain hemispheres washed in a
// calm-to-warm mood gradient (blue → purple → amber).
export function Logo({ className = "h-12 w-auto", title = "MindCloud" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 96 78"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="mc-mood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6fb7e8" />
          <stop offset="0.55" stopColor="#9b87e0" />
          <stop offset="1" stopColor="#f3a65a" />
        </linearGradient>
      </defs>
      <path
        d="M46 6 Q22 2 18 24 Q2 28 8 46 Q2 62 22 66 Q30 76 46 70 Z"
        fill="url(#mc-mood)"
        stroke="#7a6bcf"
        strokeWidth="2"
      />
      <path
        d="M50 6 Q74 2 78 24 Q94 28 88 46 Q94 62 74 66 Q66 76 50 70 Z"
        fill="url(#mc-mood)"
        stroke="#7a6bcf"
        strokeWidth="2"
      />
      <path d="M46 12 L46 70" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
      <path
        d="M26 26 Q36 32 26 38 M28 50 Q38 54 28 60"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        opacity="0.7"
        strokeLinecap="round"
      />
      <path
        d="M70 26 Q60 32 70 38 M68 50 Q58 54 68 60"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        opacity="0.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
