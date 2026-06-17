"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { IntegrityShell } from "@/imports/integrity/ui/components/IntegrityShell.jsx";
import { DataQualityView } from "@/imports/integrity/ui/components/DataQualityView.jsx";

export default function DataQualityPage() {
  const { access } = useDataset();
  return (
    <IntegrityShell>
      <DataQualityView access={access} />
    </IntegrityShell>
  );
}
