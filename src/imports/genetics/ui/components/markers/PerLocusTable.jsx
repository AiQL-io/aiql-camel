"use client";

import React, { useMemo } from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { DataTable } from "@/imports/core/components/DataTable.jsx";
import { LOCUS_COLUMNS, flagReasons } from "./markersHelpers.js";

function cellWarn(key, l) {
  if (key === "hweP") return l.hweP < 0.05;
  if (key === "pic") return l.pic < 0.4;
  if (key === "missingPct") return l.missingPct > 15;
  if (key === "nullEst") return l.nullEst > 0.15;
  return false;
}

export function PerLocusTable({ perLocus, selected, onSelect }) {
  const columns = useMemo(() => {
    const flagCol = {
      id: "flag",
      header: "",
      enableSorting: false,
      cell: (c) => {
        const l = c.row.original;
        if (!l.flagged) return null;
        const reasons = flagReasons(l);
        return (
          <span className="flagcol" title={reasons.join(", ")}>
            <Icon name="warning" size={12} />
          </span>
        );
      },
    };

    const dataCols = LOCUS_COLUMNS.map((col) =>
      col.mono
        ? {
            id: col.key,
            header: col.label,
            accessorKey: col.key,
            cell: (c) => {
              const l = c.row.original;
              return (
                <span className={`loc${l.flagged ? " flagged" : ""}`}>
                  {l.locus}
                </span>
              );
            },
          }
        : {
            id: col.key,
            header: col.label,
            accessorFn: (l) => l[col.key],
            meta: { align: "end" },
            cell: (c) => {
              const l = c.row.original;
              const v = l[col.key];
              const text =
                col.key === "missingPct"
                  ? `${v.toFixed(1)}%`
                  : v.toFixed(col.digits);
              return (
                <span className={`num${cellWarn(col.key, l) ? " warn" : ""}`}>
                  {text}
                </span>
              );
            },
          },
    );

    return [flagCol, ...dataCols];
  }, []);

  return (
    <CellStyles>
      <DataTable
        columns={columns}
        data={perLocus}
        maxHeight={420}
        onRowClick={(l) => onSelect(l.locus)}
        getRowClassName={(l) =>
          `${selected === l.locus ? "on" : ""}${l.flagged ? " flagged" : ""}`
        }
        emptyMessage="No loci in scope."
      />
    </CellStyles>
  );
}

const CellStyles = styled.div`
  .flagcol {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--status-warning, var(--danger));
  }
  .loc {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .loc.flagged {
    color: var(--danger);
  }
  .num {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .num.warn {
    color: var(--danger);
    font-weight: var(--weight-medium);
  }
  tbody tr.on td {
    background: var(--accent-soft);
  }
`;
