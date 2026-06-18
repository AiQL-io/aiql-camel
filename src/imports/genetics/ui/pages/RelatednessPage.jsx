"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { GeneticsShell } from "@/imports/genetics/ui/components/GeneticsShell.jsx";
import { RelatednessMatrixView } from "@/imports/genetics/ui/components/RelatednessMatrixView.jsx";

export default function RelatednessPage() {
  const { access } = useDataset();
  return (
    <GeneticsShell access={access}>
      <RelatednessMatrixView access={access} />
    </GeneticsShell>
  );
}
