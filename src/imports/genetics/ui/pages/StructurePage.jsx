"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { GeneticsShell } from "@/imports/genetics/ui/components/GeneticsShell.jsx";
import { StructureView } from "@/imports/genetics/ui/components/StructureView.jsx";

export default function StructurePage() {
  const { access } = useDataset();
  return (
    <GeneticsShell access={access}>
      <StructureView access={access} />
    </GeneticsShell>
  );
}
