"use client";

import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { LOCUS_COLUMNS, flagReasons } from "./markersHelpers.js";

export function PerLocusTable({ perLocus, selected, onSelect }) {
  const [sort, setSort] = useState({ key: "pic", dir: "desc" });

  const rows = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    return perLocus.slice().sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });
  }, [perLocus, sort]);

  const setKey = (key) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "locus" ? "asc" : "desc" },
    );

  return (
    <Table style={{ "--cols": LOCUS_COLUMNS.length }}>
      <div className="thead">
        <span className="flagcol" />
        {LOCUS_COLUMNS.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`th${c.mono ? " left" : ""}`}
            onClick={() => setKey(c.key)}
          >
            {c.label}
            {sort.key === c.key && (
              <Icon
                name={sort.dir === "asc" ? "caret-up" : "caret-down"}
                size={9}
              />
            )}
          </button>
        ))}
      </div>
      <div className="tbody">
        {rows.map((l) => {
          const reasons = flagReasons(l);
          const on = selected === l.locus;
          return (
            <button
              key={l.locus}
              type="button"
              className={`trow${on ? " on" : ""}${l.flagged ? " flagged" : ""}`}
              onClick={() => onSelect(l.locus)}
            >
              <span className="flagcol">
                {l.flagged && (
                  <span title={reasons.join(", ")}>
                    <Icon name="warning" size={12} />
                  </span>
                )}
              </span>
              {LOCUS_COLUMNS.map((c) => (
                <span
                  key={c.key}
                  className={
                    c.mono ? "loc" : `num${cellWarn(c.key, l) ? " warn" : ""}`
                  }
                >
                  {c.mono
                    ? l.locus
                    : c.key === "missingPct"
                      ? `${l[c.key].toFixed(1)}%`
                      : l[c.key].toFixed(c.digits)}
                </span>
              ))}
            </button>
          );
        })}
      </div>
    </Table>
  );
}

function cellWarn(key, l) {
  if (key === "hweP") return l.hweP < 0.05;
  if (key === "pic") return l.pic < 0.4;
  if (key === "missingPct") return l.missingPct > 15;
  if (key === "nullEst") return l.nullEst > 0.15;
  return false;
}

const Table = styled.div`
  .thead,
  .trow {
    display: grid;
    grid-template-columns: 26px 1.2fr repeat(9, 1fr);
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
  }
  .thead {
    background: var(--bg-muted, var(--surface-2));
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .th {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
    border: none;
    background: transparent;
    color: var(--fg-subtle);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    cursor: pointer;
    padding: 0;
  }
  .th.left {
    justify-content: flex-start;
  }
  .tbody {
    max-height: 420px;
    overflow-y: auto;
  }
  .trow {
    width: 100%;
    border: none;
    border-bottom: 1px solid var(--separator);
    background: transparent;
    font-size: var(--text-sm);
    cursor: pointer;
    text-align: end;
  }
  .trow:hover {
    background: var(--surface-2);
  }
  .trow.on {
    background: var(--accent-soft);
  }
  .trow.flagged .loc {
    color: var(--danger);
  }
  .flagcol {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--status-warning, var(--danger));
  }
  .loc {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
    text-align: start;
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
`;
