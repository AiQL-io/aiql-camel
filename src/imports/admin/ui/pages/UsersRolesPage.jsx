"use client";

import React from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { AdminShell } from "@/imports/admin/ui/components/AdminShell.jsx";
import { UsersRolesView } from "@/imports/admin/ui/components/UsersRolesView.jsx";

export default function UsersRolesPage() {
  const { access } = useDataset();
  return (
    <AdminShell>
      <UsersRolesView access={access} />
    </AdminShell>
  );
}
