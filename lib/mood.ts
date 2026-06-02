export type Mood = { score: number; emoji: string; label: string };

export const MOODS: Mood[] = [
  { score: 1, emoji: "😞", label: "Struggling" },
  { score: 2, emoji: "😕", label: "Low" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😄", label: "Great" },
];

export function moodLabel(score: number): string {
  return MOODS.find((m) => m.score === score)?.label ?? "Unknown";
}
