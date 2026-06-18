"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { GeneticsShell } from "@/imports/genetics/ui/components/GeneticsShell.jsx";
import { ClustersView } from "@/imports/genetics/ui/components/ClustersView.jsx";

export default function ClustersPage() {
  const { access } = useDataset();
  return (
    <GeneticsShell access={access}>
      <ClustersView access={access} />
    </GeneticsShell>
  );
}
