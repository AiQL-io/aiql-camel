"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { GeneticsShell } from "@/imports/genetics/ui/components/GeneticsShell.jsx";
import { MarkersView } from "@/imports/genetics/ui/components/MarkersView.jsx";

export default function MarkersPage() {
  const { access } = useDataset();
  return (
    <GeneticsShell access={access}>
      <MarkersView access={access} />
    </GeneticsShell>
  );
}
