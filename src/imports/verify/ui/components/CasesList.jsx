"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { STATUS_TONE, VERDICT_TONE } from "./caseHelpers.js";

export function CasesList({ cases, list, filter, setFilter, selId, setSelId }) {
  return (
    <Card padding={0}>
      <Head>
        <Overline>Cases ({cases.length})</Overline>
        <div className="filters">
          {["", "draft", "review", "approved", "rejected"].map((s) => (
            <button
              key={s || "all"}
              type="button"
              className={filter === s ? "on" : ""}
              onClick={() => setFilter(s)}
            >
              {s || "all"}
            </button>
          ))}
        </div>
      </Head>
      <Rows>
        {list.map((c) => (
          <button
            key={c.id}
            type="button"
            className={selId === c.id ? "crow on" : "crow"}
            onClick={() => setSelId(c.id)}
          >
            <span className="num">{c.number}</span>
            <span className="subj">
              {c.subjects.offspring?.name} · {c.type}
            </span>
            <span className="tags">
              <CapChip size="sm" tone={VERDICT_TONE[c.verdict] || "default"}>
                {c.verdict}
              </CapChip>
              <CapChip size="sm" tone={STATUS_TONE[c.status]}>
                {c.status}
              </CapChip>
            </span>
          </button>
        ))}
      </Rows>
    </Card>
  );
}

const CapChip = styled(Chip)`
  text-transform: capitalize;
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);

  .filters {
    display: flex;
    gap: 4px;
  }
  .filters button {
    height: 24px;
    padding: 0 8px;
    border: none;
    background: transparent;
    color: var(--fg-subtle);
    font-size: 11px;
    text-transform: capitalize;
    cursor: pointer;
    border-radius: var(--radius-pill);
  }
  .filters button.on {
    background: var(--accent-soft);
    color: var(--accent);
  }
`;

const Rows = styled.div`
  padding: 8px;
  max-height: 600px;
  overflow-y: auto;

  .crow {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid transparent;
    background: transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    text-align: start;
  }
  .crow:hover {
    background: var(--surface-2);
  }
  .crow.on {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .crow .num {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .crow .subj {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .crow .tags {
    display: flex;
    gap: 6px;
    margin-top: 2px;
  }
`;
