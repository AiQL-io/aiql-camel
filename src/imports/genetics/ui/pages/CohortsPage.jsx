"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { GeneticsShell } from "@/imports/genetics/ui/components/GeneticsShell.jsx";
import { CohortsView } from "@/imports/genetics/ui/components/CohortsView.jsx";

export default function CohortsPage() {
  const { access } = useDataset();
  return (
    <GeneticsShell access={access}>
      <CohortsView access={access} />
    </GeneticsShell>
  );
}
