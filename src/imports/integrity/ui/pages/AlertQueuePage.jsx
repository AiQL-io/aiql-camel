"use client";

import React, { Suspense } from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { IntegrityShell } from "@/imports/integrity/ui/components/IntegrityShell.jsx";
import { AlertQueueView } from "@/imports/integrity/ui/components/AlertQueueView.jsx";

export default function AlertQueuePage() {
  const { access } = useDataset();
  return (
    <IntegrityShell>
      <Suspense fallback={null}>
        <AlertQueueView access={access} />
      </Suspense>
    </IntegrityShell>
  );
}
