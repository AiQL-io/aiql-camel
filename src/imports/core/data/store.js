import { generateDataset } from "./generator/index.js";

let cached = null;

export function getDataset() {
  if (!cached) cached = generateDataset({ seed: 42, size: 5000 });
  return cached;
}

export function isDatasetReady() {
  return cached !== null;
}
