"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { DataTable } from "@/imports/core/components/DataTable.jsx";

export function PerLocusCompare({ drivers, nameA, nameB }) {
  const [metric, setMetric] = useState("ho");

  const rows = useMemo(() => {
    const dKey = metric === "ho" ? "dHo" : "dHe";
    const aKey = metric === "ho" ? "hoA" : "heA";
    const bKey = metric === "ho" ? "hoB" : "heB";
    return drivers
      .map((d) => ({
        locus: d.locus,
        a: d[aKey],
        b: d[bKey],
        delta: d[dKey],
      }))
      .sort((x, y) => y.delta - x.delta)
      .slice(0, 12);
  }, [drivers, metric]);

  const max = useMemo(
    () => Math.max(...rows.map((d) => d.delta), 1e-9),
    [rows],
  );
  const mlabel = metric === "ho" ? "Ho" : "He";

  const columns = useMemo(
    () => [
      {
        id: "locus",
        header: "Locus",
        accessorKey: "locus",
        cell: (c) => (
          <Link
            className="loc"
            href={`/genetics/markers?locus=${c.getValue()}`}
          >
            {c.getValue()} <Icon name="arrow-up-right" size={11} />
          </Link>
        ),
      },
      {
        id: "a",
        header: `${nameA} ${mlabel}`,
        accessorFn: (d) => d.a,
        meta: { align: "end" },
        cell: (c) => (
          <span className="mono">{c.row.original.a.toFixed(3)}</span>
        ),
      },
      {
        id: "b",
        header: `${nameB} ${mlabel}`,
        accessorFn: (d) => d.b,
        meta: { align: "end" },
        cell: (c) => (
          <span className="mono">{c.row.original.b.toFixed(3)}</span>
        ),
      },
      {
        id: "delta",
        header: "|Δ| (driver)",
        accessorFn: (d) => d.delta,
        cell: (c) => {
          const d = c.row.original;
          return (
            <span className="delta">
              <span className="track">
                <span
                  className="fill"
                  style={{ width: `${(d.delta / max) * 100}%` }}
                />
              </span>
              <b>{d.delta.toFixed(3)}</b>
            </span>
          );
        },
      },
    ],
    [nameA, nameB, mlabel, max],
  );

  if (!drivers.length) return null;

  return (
    <Root>
      <div className="bar">
        <span className="lab">Driver metric</span>
        <div className="seg">
          <button
            type="button"
            className={metric === "ho" ? "on" : ""}
            onClick={() => setMetric("ho")}
          >
            Observed (Ho)
          </button>
          <button
            type="button"
            className={metric === "he" ? "on" : ""}
            onClick={() => setMetric("he")}
          >
            Expected (He)
          </button>
        </div>
      </div>
      <CellStyles>
        <DataTable columns={columns} data={rows} emptyMessage="No drivers." />
      </CellStyles>
      <p className="hint">
        Loci with the largest {mlabel} gap drive differentiation. Click a locus
        to inspect its allele frequencies in Marker Panel Analytics.
      </p>
    </Root>
  );
}

const Root = styled.div`
  .bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .bar .lab {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .seg {
    display: flex;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }
  .seg button {
    border: none;
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    padding: 5px 10px;
    cursor: pointer;
  }
  .seg button.on {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .hint {
    margin-top: 10px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;

const CellStyles = styled.div`
  .loc {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .delta {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .delta .track {
    flex: 1;
    height: 6px;
    background: var(--surface-2);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }
  .delta .fill {
    display: block;
    height: 100%;
    background: var(--aiql-bar-gradient);
    transform-origin: left center;
    animation: aiql-grow-x 720ms cubic-bezier(0.2, 0.75, 0.25, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    .delta .fill {
      animation: none;
    }
  }
  .delta b {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
`;
