"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { GeneticsShell } from "@/imports/genetics/ui/components/GeneticsShell.jsx";
import { InbreedingView } from "@/imports/genetics/ui/components/InbreedingView.jsx";

export default function InbreedingPage() {
  const { access } = useDataset();
  return (
    <GeneticsShell access={access}>
      <InbreedingView access={access} />
    </GeneticsShell>
  );
}
