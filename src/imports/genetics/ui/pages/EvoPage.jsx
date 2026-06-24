"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { GeneticsShell } from "@/imports/genetics/ui/components/GeneticsShell.jsx";
import { EvoView } from "@/imports/genetics/ui/components/evo/EvoView.jsx";

export default function EvoPage() {
  const { access } = useDataset();
  return (
    <GeneticsShell access={access}>
      <EvoView />
    </GeneticsShell>
  );
}
