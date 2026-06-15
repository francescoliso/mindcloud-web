export const DIMENSIONS = [
  { key: "work",       label: "Work" },
  { key: "love",       label: "Love" },
  { key: "friendship", label: "Friendship" },
  { key: "family",     label: "Family" },
  { key: "health",     label: "Health" },
  { key: "mind",       label: "Mind" },
  { key: "finance",    label: "Finance" },
  { key: "growth",     label: "Growth" },
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number]["key"];

export const DIMENSION_KEYS = DIMENSIONS.map((d) => d.key);

export type Goals    = Record<DimensionKey, number>;
export type Current  = Record<DimensionKey, { score: number; comment: string }>;
