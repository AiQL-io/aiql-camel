"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { ReportsShell } from "@/imports/reports/ui/components/ReportsShell.jsx";
import { ReportHistoryView } from "@/imports/reports/ui/components/ReportHistoryView.jsx";

export default function ReportHistoryPage() {
  const { access } = useDataset();
  return (
    <ReportsShell>
      <ReportHistoryView access={access} />
    </ReportsShell>
  );
}
