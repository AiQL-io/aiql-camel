"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { GeneticsShell } from "@/imports/genetics/ui/components/GeneticsShell.jsx";
import { MethodsView } from "@/imports/genetics/ui/components/MethodsView.jsx";

export default function MethodsPage() {
  const { access } = useDataset();
  return (
    <GeneticsShell access={access}>
      <MethodsView />
    </GeneticsShell>
  );
}
