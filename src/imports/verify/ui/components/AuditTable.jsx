"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { DataTable } from "@/imports/core/components/DataTable.jsx";
import {
  VERDICT_TONE,
  exportCsv,
  exportIntegrityReport,
} from "./auditConstants.js";

export function AuditTable({
  rows,
  can,
  onCreateExclusionCases,
  provenance,
  summary,
  total,
}) {
  const data = useMemo(() => rows.slice(0, 200), [rows]);

  const columns = useMemo(
    () => [
      {
        id: "offspring",
        header: "Offspring",
        accessorKey: "offspring",
        cell: (c) => (
          <Link
            href={`/registry/${c.row.original.offspringId}`}
            className="off"
          >
            {c.getValue()}
          </Link>
        ),
      },
      {
        id: "parent",
        header: "Declared parent",
        accessorKey: "parent",
        cell: (c) => (
          <span className="mono">
            {c.getValue()} <em>({c.row.original.role})</em>
          </span>
        ),
      },
      {
        id: "verdict",
        header: "Verdict",
        accessorKey: "verdict",
        cell: (c) => (
          <CapChip size="sm" tone={VERDICT_TONE[c.getValue()]}>
            {c.getValue()}
          </CapChip>
        ),
      },
      {
        id: "mismatch",
        header: "Mismatch",
        accessorKey: "mismatchCount",
        cell: (c) => <span className="mono">{c.getValue() ?? "—"}</span>,
      },
      {
        id: "lineRegion",
        header: "Line · Region",
        accessorFn: (r) => `${r.breed} · ${r.region}`,
        cell: (c) => <span className="muted">{c.getValue()}</span>,
      },
      {
        id: "open",
        header: "",
        enableSorting: false,
        meta: { align: "end" },
        cell: (c) => {
          const r = c.row.original;
          return (
            <Link
              href={`/verify?offspring=${r.offspringId}&${r.role}=${r.parentId}&mode=${r.role === "dam" ? "maternity" : "paternity"}`}
              className="open"
            >
              Workbench <Icon name="arrow-right" size={11} />
            </Link>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <BulkBar>
        <button type="button" onClick={() => exportCsv(rows, provenance)}>
          <Icon name="download-simple" size={14} /> Export
        </button>
        <button
          type="button"
          onClick={() => exportIntegrityReport(summary, total, provenance)}
        >
          <Icon name="certificate" size={14} /> Integrity report
        </button>
        {can("resolveIntegrity") && (
          <button type="button" onClick={onCreateExclusionCases}>
            <Icon name="flag" size={14} /> Create cases + alerts (exclusions)
          </button>
        )}
      </BulkBar>

      <TableWrap>
        <CellStyles>
          <DataTable
            columns={columns}
            data={data}
            maxHeight={460}
            emptyMessage="No declared links match these filters."
          />
        </CellStyles>
        {rows.length > 200 && (
          <div className="more">
            Showing first 200 of {rows.length.toLocaleString()} — export for the
            full set.
          </div>
        )}
      </TableWrap>
    </>
  );
}

const CapChip = styled(Chip)`
  text-transform: capitalize;
`;

const BulkBar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 18px;

  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  button:hover {
    background: var(--surface-2);
  }
`;

const TableWrap = styled.div`
  margin-top: 14px;

  .more {
    padding: 12px 14px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;

const CellStyles = styled.div`
  .off {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .mono em {
    font-style: normal;
    color: var(--fg-subtle);
  }
  .muted {
    color: var(--fg-secondary);
    font-size: var(--text-xs);
  }
  .open {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
`;
