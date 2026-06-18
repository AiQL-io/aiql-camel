"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { AdminShell } from "@/imports/admin/ui/components/AdminShell.jsx";
import { MarkerPanelView } from "@/imports/admin/ui/components/MarkerPanelView.jsx";

export default function MarkerPanelPage() {
  const { access } = useDataset();
  return (
    <AdminShell>
      <MarkerPanelView access={access} />
    </AdminShell>
  );
}
