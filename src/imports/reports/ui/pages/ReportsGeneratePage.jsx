"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { ReportsShell } from "@/imports/reports/ui/components/ReportsShell.jsx";
import { ReportsGenerateView } from "@/imports/reports/ui/components/ReportsGenerateView.jsx";

export default function ReportsGeneratePage() {
  const { access } = useDataset();
  return (
    <ReportsShell>
      <ReportsGenerateView access={access} />
    </ReportsShell>
  );
}
