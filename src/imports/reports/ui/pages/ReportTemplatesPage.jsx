"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { ReportsShell } from "@/imports/reports/ui/components/ReportsShell.jsx";
import { ReportTemplatesView } from "@/imports/reports/ui/components/ReportTemplatesView.jsx";

export default function ReportTemplatesPage() {
  const { access } = useDataset();
  return (
    <ReportsShell>
      <ReportTemplatesView access={access} />
    </ReportsShell>
  );
}
