"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { ReportsShell } from "@/imports/reports/ui/components/ReportsShell.jsx";
import { ReportVerifyView } from "@/imports/reports/ui/components/ReportVerifyView.jsx";

export default function ReportVerifyPage({ code }) {
  const { access } = useDataset();
  return (
    <ReportsShell>
      <ReportVerifyView access={access} code={code} />
    </ReportsShell>
  );
}
