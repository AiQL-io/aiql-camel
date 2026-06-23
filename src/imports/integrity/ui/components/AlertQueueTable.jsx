"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { DataTable } from "@/imports/core/components/DataTable.jsx";
import { TYPE_LABEL } from "@/imports/integrity/state/alertStore.js";
import { SEV_TONE, STATUS_TONE } from "./alertConstants.js";

export function AlertQueueTable({ rows, access, selected, toggle, toggleAll }) {
  const allChecked = selected.size === rows.length && rows.length > 0;

  const columns = useMemo(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: () => (
          <span className="ck" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll} />
          </span>
        ),
        cell: (c) => (
          <span className="ck" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selected.has(c.row.original.id)}
              onChange={() => toggle(c.row.original.id)}
            />
          </span>
        ),
      },
      {
        id: "severity",
        header: "Severity",
        accessorKey: "severity",
        cell: (c) => (
          <CapChip size="sm" tone={SEV_TONE[c.getValue()]}>
            {c.getValue()}
          </CapChip>
        ),
      },
      {
        id: "type",
        header: "Type",
        accessorFn: (a) => TYPE_LABEL[a.type],
        cell: (c) => (
          <Link href={`/integrity/${c.row.original.id}`} className="type">
            {c.getValue()}
          </Link>
        ),
      },
      {
        id: "subject",
        header: "Subject",
        accessorFn: (a) => {
          const subj = a.subjectId ? access.getAnimal(a.subjectId) : null;
          return subj ? subj.registrationId : a.locus || "—";
        },
        cell: (c) => {
          const a = c.row.original;
          const subj = a.subjectId ? access.getAnimal(a.subjectId) : null;
          return (
            <span className="subj">
              {subj ? (
                <Link href={`/registry/${subj.id}`}>{subj.registrationId}</Link>
              ) : (
                <span className="mono">{a.locus || "—"}</span>
              )}
            </span>
          );
        },
      },
      {
        id: "related",
        header: "Related",
        enableSorting: false,
        cell: (c) => {
          const a = c.row.original;
          const related = (a.relatedIds || [])
            .map((id) => access.getAnimal(id))
            .filter(Boolean);
          return (
            <span className="rel">
              {related.length === 0 ? (
                <span className="mono">—</span>
              ) : (
                related.slice(0, 2).map((r, i) => (
                  <React.Fragment key={r.id}>
                    {i > 0 && <span className="sep">, </span>}
                    <Link href={`/registry/${r.id}`}>{r.registrationId}</Link>
                  </React.Fragment>
                ))
              )}
              {related.length > 2 && (
                <span className="more"> +{related.length - 2}</span>
              )}
            </span>
          );
        },
      },
      {
        id: "evidence",
        header: "Evidence",
        accessorFn: (a) => a.evidence.rule,
        cell: (c) => <span className="ev">{c.getValue()}</span>,
      },
      {
        id: "detected",
        header: "Detected",
        accessorKey: "detectedAt",
        cell: (c) => <span className="mono">{c.getValue()?.slice(0, 10)}</span>,
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: (c) => (
          <CapChip size="sm" tone={STATUS_TONE[c.getValue()]}>
            {c.getValue().replace("_", " ")}
          </CapChip>
        ),
      },
      {
        id: "assignee",
        header: "Assignee",
        accessorFn: (a) => a.assignee || "—",
        cell: (c) => <span className="mono">{c.getValue()}</span>,
      },
    ],
    [access, selected, toggle, toggleAll, allChecked],
  );

  return (
    <TableCard padding={0}>
      <CellStyles>
        <DataTable
          columns={columns}
          data={rows}
          pageSize={20}
          maxHeight={560}
          emptyMessage="No alerts match these filters."
        />
      </CellStyles>
    </TableCard>
  );
}

const TableCard = styled(Card)`
  margin-top: 12px;
`;

const CapChip = styled(Chip)`
  text-transform: capitalize;
`;

const CellStyles = styled.div`
  .ck {
    display: flex;
    align-items: center;
  }
  .type {
    font-weight: var(--weight-medium);
    color: var(--accent);
  }
  .subj a {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .rel {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rel a {
    color: var(--accent);
  }
  .rel .more {
    color: var(--fg-subtle);
  }
  .ev {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;
