"use client";

import React, { Suspense } from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { VerifyShell } from "@/imports/verify/ui/components/VerifyShell.jsx";
import { WorkbenchView } from "@/imports/verify/ui/components/WorkbenchView.jsx";

export default function WorkbenchPage() {
  const { access } = useDataset();
  return (
    <VerifyShell>
      <Suspense fallback={null}>
        <WorkbenchView access={access} />
      </Suspense>
    </VerifyShell>
  );
}
