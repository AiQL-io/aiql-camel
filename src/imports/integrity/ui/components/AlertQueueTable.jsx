"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { TYPE_LABEL } from "@/imports/integrity/state/alertStore.js";
import { SEV_TONE, STATUS_TONE } from "./alertConstants.js";

export function AlertQueueTable({ rows, access, selected, toggle, toggleAll }) {
  return (
    <TableCard padding={0}>
      <Table>
        <div className="thead">
          <span className="ck">
            <input
              type="checkbox"
              checked={selected.size === rows.length && rows.length > 0}
              onChange={toggleAll}
            />
          </span>
          <span>Severity</span>
          <span>Type</span>
          <span>Subject</span>
          <span>Related</span>
          <span>Evidence</span>
          <span>Detected</span>
          <span>Status</span>
          <span>Assignee</span>
        </div>
        <div className="tbody">
          {rows.slice(0, 300).map((a) => {
            const subj = a.subjectId ? access.getAnimal(a.subjectId) : null;
            const related = (a.relatedIds || [])
              .map((id) => access.getAnimal(id))
              .filter(Boolean);
            return (
              <div className="trow" key={a.id}>
                <span className="ck" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(a.id)}
                    onChange={() => toggle(a.id)}
                  />
                </span>
                <span>
                  <CapChip size="sm" tone={SEV_TONE[a.severity]}>
                    {a.severity}
                  </CapChip>
                </span>
                <Link href={`/integrity/${a.id}`} className="type">
                  {TYPE_LABEL[a.type]}
                </Link>
                <span className="subj">
                  {subj ? (
                    <Link href={`/registry/${subj.id}`}>
                      {subj.registrationId}
                    </Link>
                  ) : (
                    <span className="mono">{a.locus || "—"}</span>
                  )}
                </span>
                <span className="rel">
                  {related.length === 0 ? (
                    <span className="mono">—</span>
                  ) : (
                    related.slice(0, 2).map((r, i) => (
                      <React.Fragment key={r.id}>
                        {i > 0 && <span className="sep">, </span>}
                        <Link href={`/registry/${r.id}`}>
                          {r.registrationId}
                        </Link>
                      </React.Fragment>
                    ))
                  )}
                  {related.length > 2 && (
                    <span className="more"> +{related.length - 2}</span>
                  )}
                </span>
                <span className="ev">{a.evidence.rule}</span>
                <span className="mono">{a.detectedAt?.slice(0, 10)}</span>
                <span>
                  <CapChip size="sm" tone={STATUS_TONE[a.status]}>
                    {a.status.replace("_", " ")}
                  </CapChip>
                </span>
                <span className="mono">{a.assignee || "—"}</span>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div className="empty">No alerts match these filters.</div>
          )}
        </div>
      </Table>
    </TableCard>
  );
}

const TableCard = styled(Card)`
  margin-top: 12px;
`;

const CapChip = styled(Chip)`
  text-transform: capitalize;
`;

const Table = styled.div`
  .thead,
  .trow {
    display: grid;
    grid-template-columns: 34px 90px 150px 110px 110px 1.6fr 96px 100px 120px;
    gap: 10px;
    align-items: center;
    padding: 10px 16px;
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
    max-height: 560px;
    overflow-y: auto;
  }
  .trow {
    border-bottom: 1px solid var(--separator);
    font-size: var(--text-sm);
  }
  .trow:hover {
    background: var(--surface-2);
  }
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
  .empty {
    padding: 24px 16px;
    text-align: center;
    color: var(--fg-subtle);
    font-size: var(--text-sm);
  }
`;
