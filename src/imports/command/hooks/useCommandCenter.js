"use client";

import { useState } from "react";

export function useCommandCenter() {
  const [period, setPeriod] = useState("90");
  const [executive, setExecutive] = useState(false);

  return { period, setPeriod, executive, setExecutive };
}
