"use client";

import { useState } from "react";
import { getDataset } from "./store.js";
import { createAccess } from "./access.js";

let accessCache = null;

function buildAccess() {
  if (!accessCache) accessCache = createAccess(getDataset());
  return accessCache;
}

export function useDataset() {
  const [access] = useState(buildAccess);
  return { access, loading: false };
}
