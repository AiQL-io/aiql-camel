"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { VerifyShell } from "@/imports/verify/ui/components/VerifyShell.jsx";
import { ReverseSearchView } from "@/imports/verify/ui/components/ReverseSearchView.jsx";

export default function ReverseSearchPage() {
  const { access } = useDataset();
  return (
    <VerifyShell>
      <ReverseSearchView access={access} />
    </VerifyShell>
  );
}
