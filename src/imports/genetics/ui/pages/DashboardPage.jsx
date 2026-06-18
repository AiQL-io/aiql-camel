"use client";

import React, { Suspense } from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { GeneticsShell } from "@/imports/genetics/ui/components/GeneticsShell.jsx";
import { DashboardView } from "@/imports/genetics/ui/components/DashboardView.jsx";

export default function DashboardPage() {
  const { access } = useDataset();
  return (
    <GeneticsShell access={access}>
      <Suspense fallback={null}>
        <DashboardView access={access} />
      </Suspense>
    </GeneticsShell>
  );
}
