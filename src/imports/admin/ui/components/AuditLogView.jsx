"use client";

import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Select } from "@/imports/core/components/Select.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { DataTable } from "@/imports/core/components/DataTable.jsx";
import { useAdmin, ROLE_DEFS } from "@/imports/admin/state/adminStore.js";

const ENTITY_ICON = {
  certificate: "certificate",
  alert: "warning",
  camel: "identification-card",
  batch: "stack",
  cohort: "users-three",
  export: "download-simple",
  user: "user",
  panel: "dna",
  report: "file-text",
  session: "sign-in",
  reference: "list",
};

export function AuditLogView({ access }) {
  const { audit } = useAdmin(access);
  const [q, setQ] = useState("");
  const [actor, setActor] = useState("");
  const [entity, setEntity] = useState("");

  const actorOptions = useMemo(
    () => [
      { value: "", label: "All actors" },
      ...ROLE_DEFS.map((r) => ({ value: r.id, label: r.label })),
    ],
    [],
  );
  const entityOptions = useMemo(() => {
    const types = [...new Set(audit.map((a) => a.entityType))].sort();
    return [
      { value: "", label: "All entities" },
      ...types.map((t) => ({ value: t, label: t })),
    ];
  }, [audit]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return audit.filter((a) => {
      if (actor && a.actorId !== actor) return false;
      if (entity && a.entityType !== entity) return false;
      if (
        needle &&
        !a.action.toLowerCase().includes(needle) &&
        !String(a.entityId).toLowerCase().includes(needle) &&
        !a.actorName.toLowerCase().includes(needle)
      )
        return false;
      return true;
    });
  }, [audit, q, actor, entity]);

  const columns = useMemo(
    () => [
      {
        id: "when",
        header: "When",
        accessorKey: "timestamp",
        cell: (c) => (
          <span className="when">
            {new Date(c.getValue()).toLocaleString()}
          </span>
        ),
      },
      {
        id: "actor",
        header: "Actor",
        accessorKey: "actorName",
        cell: (c) => <span className="actor">{c.getValue()}</span>,
      },
      {
        id: "action",
        header: "Action",
        accessorKey: "action",
        enableSorting: false,
        cell: (c) => {
          const a = c.row.original;
          return (
            <span className="action">
              {a.action}
              {a.before != null && a.after != null && (
                <span className="delta">
                  <span className="b">{a.before}</span>
                  <Icon name="arrow-right" size={11} />
                  <span className="af">{a.after}</span>
                </span>
              )}
            </span>
          );
        },
      },
      {
        id: "entity",
        header: "Entity",
        accessorKey: "entityType",
        enableSorting: false,
        cell: (c) => {
          const a = c.row.original;
          return (
            <span className="entity">
              <Icon name={ENTITY_ICON[a.entityType] || "circle"} size={12} />
              <span className="etype">{a.entityType}</span>
              {a.entityId !== "—" && <code>{a.entityId}</code>}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <Toolbar>
        <input
          placeholder="Search action, actor, or entity…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          size="sm"
          value={actor}
          onChange={setActor}
          options={actorOptions}
        />
        <Select
          size="sm"
          value={entity}
          onChange={setEntity}
          options={entityOptions}
        />
        <span className="count">{rows.length} entries</span>
      </Toolbar>

      <CellStyles>
        <DataTable
          columns={columns}
          data={rows}
          pageSize={15}
          emptyMessage="No audit entries match these filters."
        />
      </CellStyles>
    </>
  );
}

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;

  input {
    width: 280px;
    max-width: 50vw;
    padding: 7px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    color: var(--fg);
    font-size: var(--text-sm);
  }
  .count {
    margin-inline-start: auto;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-family: var(--font-mono);
  }
`;

const CellStyles = styled.div`
  .when {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .actor {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .action {
    color: var(--fg);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .action .delta {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .action .delta .b {
    text-decoration: line-through;
    opacity: 0.7;
  }
  .action .delta .af {
    color: var(--status-success);
  }
  .entity {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
  }
  .entity .etype {
    text-transform: capitalize;
  }
  .entity code {
    font-family: var(--font-mono);
    color: var(--accent);
  }
`;
