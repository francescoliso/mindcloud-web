"use client";

import { DIMENSIONS, type Goals, type Current } from "@/lib/dimensions";

const SIZE   = 300;
const CENTER = SIZE / 2;
const RADIUS = 110;
const N      = DIMENSIONS.length;

function point(score: number, index: number): [number, number] {
  const angle = (2 * Math.PI * index) / N - Math.PI / 2;
  const r = (score / 10) * RADIUS;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

function polygon(scores: number[]): string {
  return scores.map((s, i) => point(s, i).join(",")).join(" ");
}

function labelPos(index: number): [number, number] {
  const angle  = (2 * Math.PI * index) / N - Math.PI / 2;
  const offset = RADIUS + 22;
  return [CENTER + offset * Math.cos(angle), CENTER + offset * Math.sin(angle)];
}

export function WheelChart({ goals, current }: { goals: Goals; current: Current }) {
  const goalScores    = DIMENSIONS.map((d) => goals[d.key]);
  const currentScores = DIMENSIONS.map((d) => current[d.key].score);

  // Grid rings at 2, 4, 6, 8, 10
  const rings = [2, 4, 6, 8, 10];

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-xs mx-auto select-none">
      {/* Grid rings */}
      {rings.map((v) => (
        <polygon
          key={v}
          points={polygon(Array(N).fill(v))}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-sky-100 dark:text-sky-900/60"
        />
      ))}

      {/* Axis lines */}
      {DIMENSIONS.map((_, i) => {
        const [x, y] = point(10, i);
        return (
          <line
            key={i}
            x1={CENTER} y1={CENTER}
            x2={x} y2={y}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-sky-100 dark:text-sky-900/60"
          />
        );
      })}

      {/* Goal polygon */}
      <polygon
        points={polygon(goalScores)}
        fill="rgba(56,189,248,0.08)"
        stroke="rgb(56,189,248)"
        strokeWidth="1.5"
        strokeDasharray="4 2"
      />

      {/* Current polygon */}
      <polygon
        points={polygon(currentScores)}
        fill="rgba(14,165,233,0.25)"
        stroke="rgb(14,165,233)"
        strokeWidth="2"
      />

      {/* Axis labels */}
      {DIMENSIONS.map((d, i) => {
        const [x, y] = labelPos(i);
        return (
          <text
            key={d.key}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="500"
            fill="currentColor"
            className="text-neutral-600 dark:text-neutral-300"
          >
            {d.label}
          </text>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${CENTER - 60}, ${SIZE - 18})`}>
        <line x1="0" y1="5" x2="14" y2="5" stroke="rgb(56,189,248)" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x="18" y="9" fontSize="8" fill="currentColor" className="text-neutral-500">Goal</text>
        <line x1="48" y1="5" x2="62" y2="5" stroke="rgb(14,165,233)" strokeWidth="2" />
        <text x="66" y="9" fontSize="8" fill="currentColor" className="text-neutral-500">Now</text>
      </g>
    </svg>
  );
}
