"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { IntegrityShell } from "@/imports/integrity/ui/components/IntegrityShell.jsx";
import { ReconciliationView } from "@/imports/integrity/ui/components/ReconciliationView.jsx";

export default function ReconciliationPage({ subjectId }) {
  const { access } = useDataset();
  return (
    <IntegrityShell>
      <ReconciliationView access={access} subjectId={subjectId} />
    </IntegrityShell>
  );
}
