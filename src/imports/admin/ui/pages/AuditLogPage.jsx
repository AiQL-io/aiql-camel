"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { AdminShell } from "@/imports/admin/ui/components/AdminShell.jsx";
import { AuditLogView } from "@/imports/admin/ui/components/AuditLogView.jsx";

export default function AuditLogPage() {
  const { access } = useDataset();
  return (
    <AdminShell>
      <AuditLogView access={access} />
    </AdminShell>
  );
}
