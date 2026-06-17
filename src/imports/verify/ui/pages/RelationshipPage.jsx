"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { VerifyShell } from "@/imports/verify/ui/components/VerifyShell.jsx";
import { RelationshipView } from "@/imports/verify/ui/components/RelationshipView.jsx";

export default function RelationshipPage() {
  const { access } = useDataset();
  return (
    <VerifyShell>
      <RelationshipView access={access} />
    </VerifyShell>
  );
}
