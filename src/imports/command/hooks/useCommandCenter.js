"use client";

import { useState, useEffect } from "react";

export function useCommandCenter() {
  const [period, setPeriod] = useState("90");
  const [executive, setExecutive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(id);
  }, []);

  return { period, setPeriod, executive, setExecutive, loading };
}
