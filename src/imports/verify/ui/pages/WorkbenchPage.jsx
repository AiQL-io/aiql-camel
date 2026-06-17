"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { VerifyShell } from "@/imports/verify/ui/components/VerifyShell.jsx";
import { WorkbenchView } from "@/imports/verify/ui/components/WorkbenchView.jsx";

export default function WorkbenchPage() {
  const { access } = useDataset();
  return (
    <VerifyShell>
      <WorkbenchView access={access} />
    </VerifyShell>
  );
}
