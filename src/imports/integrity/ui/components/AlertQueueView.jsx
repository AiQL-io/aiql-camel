"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import {
  useAlerts,
  SEVERITY_ORDER,
} from "@/imports/integrity/state/alertStore.js";
import { SEVS } from "./alertConstants.js";
import { AlertSubjectBanner } from "./AlertSubjectBanner.jsx";
import { AlertCountStrip } from "./AlertCountStrip.jsx";
import { AlertTypeCounts } from "./AlertTypeCounts.jsx";
import { AlertFilters } from "./AlertFilters.jsx";
import { AlertBulkBar } from "./AlertBulkBar.jsx";
import { AlertQueueTable } from "./AlertQueueTable.jsx";

export function AlertQueueView({ access }) {
  const { alerts, bulkAssign, bulkDismiss } = useAlerts(access);
  const { user, can } = useRole();
  const params = useSearchParams();
  const subjectId = params.get("subject") || "";
  const subjectAnimal = subjectId ? access.getAnimal(subjectId) : null;
  const [filters, setFilters] = useState({
    type: "",
    severity: "",
    status: "open",
    region: "",
    assignee: "",
  });
  const [selected, setSelected] = useState(() => new Set());

  const setF = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  const facets = useMemo(() => {
    const u = (key) => [...new Set(alerts.map((a) => a[key]).filter(Boolean))];
    return {
      types: [...new Set(alerts.map((a) => a.type))],
      regions: u("region"),
      assignees: u("assignee"),
    };
  }, [alerts]);

  const rows = useMemo(() => {
    return alerts
      .filter(
        (a) =>
          (!subjectId || a.subjectId === subjectId) &&
          (!filters.type || a.type === filters.type) &&
          (!filters.severity || a.severity === filters.severity) &&
          (!filters.status || a.status === filters.status) &&
          (!filters.region || a.region === filters.region) &&
          (!filters.assignee || a.assignee === filters.assignee),
      )
      .sort((x, y) => {
        const s = SEVERITY_ORDER[x.severity] - SEVERITY_ORDER[y.severity];
        if (s !== 0) return s;
        return x.detectedAt < y.detectedAt ? 1 : -1;
      });
  }, [alerts, filters, subjectId]);

  const counts = useMemo(() => {
    const open = alerts.filter((a) => a.status === "open");
    const bySev = SEVS.reduce((m, s) => {
      m[s] = open.filter((a) => a.severity === s).length;
      return m;
    }, {});
    const byType = {};
    open.forEach((a) => (byType[a.type] = (byType[a.type] || 0) + 1));
    return { total: open.length, bySev, byType };
  }, [alerts]);

  const toggle = (id) =>
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected((p) =>
      p.size === rows.length ? new Set() : new Set(rows.map((r) => r.id)),
    );

  return (
    <>
      <AlertSubjectBanner subjectAnimal={subjectAnimal} />
      <AlertCountStrip counts={counts} filters={filters} setF={setF} />
      <AlertTypeCounts byType={counts.byType} filters={filters} setF={setF} />
      <AlertFilters
        filters={filters}
        setF={setF}
        setFilters={setFilters}
        facets={facets}
      />
      {selected.size > 0 && can("resolveIntegrity") && (
        <AlertBulkBar
          selected={selected}
          setSelected={setSelected}
          user={user}
          bulkAssign={bulkAssign}
          bulkDismiss={bulkDismiss}
        />
      )}
      <AlertQueueTable
        rows={rows}
        access={access}
        selected={selected}
        toggle={toggle}
        toggleAll={toggleAll}
      />
    </>
  );
}
