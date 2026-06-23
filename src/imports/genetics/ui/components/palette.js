const COLORS = [
  "#3F4DFB",
  "#18BBFD",
  "#8743FD",
  "#03D6D0",
  "#FFBF00",
  "#3FB27F",
  "#03183F",
  "#6C7BFF",
];

export function breedColors(breeds) {
  const m = {};
  breeds.forEach((b, i) => {
    m[b] = COLORS[i % COLORS.length];
  });
  return m;
}

export const PALETTE = COLORS;
