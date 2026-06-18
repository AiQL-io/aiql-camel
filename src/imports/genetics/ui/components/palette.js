const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export function breedColors(breeds) {
  const m = {};
  breeds.forEach((b, i) => {
    m[b] = COLORS[i % COLORS.length];
  });
  return m;
}

export const PALETTE = COLORS;
