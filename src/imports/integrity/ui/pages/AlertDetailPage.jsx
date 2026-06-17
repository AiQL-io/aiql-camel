"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { IntegrityShell } from "@/imports/integrity/ui/components/IntegrityShell.jsx";
import { AlertDetailView } from "@/imports/integrity/ui/components/AlertDetailView.jsx";

export default function AlertDetailPage({ alertId }) {
  const { access } = useDataset();
  return (
    <IntegrityShell>
      <AlertDetailView access={access} alertId={alertId} />
    </IntegrityShell>
  );
}
