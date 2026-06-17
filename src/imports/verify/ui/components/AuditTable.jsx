"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
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

      <Table>
        <div className="thead">
          <span>Offspring</span>
          <span>Declared parent</span>
          <span>Verdict</span>
          <span>Mismatch</span>
          <span>Line · Region</span>
          <span />
        </div>
        <div className="tbody">
          {rows.slice(0, 200).map((r, i) => (
            <div className="trow" key={`${r.offspringId}-${r.role}-${i}`}>
              <Link href={`/registry/${r.offspringId}`} className="off">
                {r.offspring}
              </Link>
              <span className="mono">
                {r.parent} <em>({r.role})</em>
              </span>
              <span>
                <CapChip size="sm" tone={VERDICT_TONE[r.verdict]}>
                  {r.verdict}
                </CapChip>
              </span>
              <span className="mono">{r.mismatchCount ?? "—"}</span>
              <span className="muted">
                {r.breed} · {r.region}
              </span>
              <Link
                href={`/verify?offspring=${r.offspringId}&${r.role}=${r.parentId}&mode=${r.role === "dam" ? "maternity" : "paternity"}`}
                className="open"
              >
                Workbench <Icon name="arrow-right" size={11} />
              </Link>
            </div>
          ))}
          {rows.length > 200 && (
            <div className="more">
              Showing first 200 of {rows.length.toLocaleString()} — export for
              the full set.
            </div>
          )}
        </div>
      </Table>
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

const Table = styled.div`
  margin-top: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;

  .thead,
  .trow {
    display: grid;
    grid-template-columns: 1.3fr 1.6fr 110px 80px 1.3fr 110px;
    gap: 10px;
    align-items: center;
    padding: 10px 14px;
  }
  .thead {
    background: var(--bg-muted);
    border-bottom: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .tbody {
    max-height: 460px;
    overflow-y: auto;
  }
  .trow {
    border-bottom: 1px solid var(--separator);
    font-size: var(--text-sm);
  }
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
  .more {
    padding: 12px 14px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;
