"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { VerifyShell } from "@/imports/verify/ui/components/VerifyShell.jsx";
import { BatchAuditView } from "@/imports/verify/ui/components/BatchAuditView.jsx";

export default function BatchAuditPage() {
  const { access } = useDataset();
  return (
    <VerifyShell>
      <BatchAuditView access={access} />
    </VerifyShell>
  );
}
