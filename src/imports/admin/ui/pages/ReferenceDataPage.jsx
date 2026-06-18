"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { AdminShell } from "@/imports/admin/ui/components/AdminShell.jsx";
import { ReferenceDataView } from "@/imports/admin/ui/components/ReferenceDataView.jsx";

export default function ReferenceDataPage() {
  const { access } = useDataset();
  return (
    <AdminShell>
      <ReferenceDataView access={access} />
    </AdminShell>
  );
}
