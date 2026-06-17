"use client";

import React from "react";
import { VerifyShell } from "@/imports/verify/ui/components/VerifyShell.jsx";
import { CasesView } from "@/imports/verify/ui/components/CasesView.jsx";

export default function CasesPage() {
  return (
    <VerifyShell>
      <CasesView />
    </VerifyShell>
  );
}
