"use client";

import React from "react";
import styled from "styled-components";
import { TYPE_LABEL } from "@/imports/integrity/state/alertStore.js";

export function AlertTypeCounts({ byType, filters, setF }) {
  return (
    <Wrap>
      {Object.entries(byType)
        .sort((a, b) => b[1] - a[1])
        .map(([t, n]) => (
          <button
            key={t}
            type="button"
            className={filters.type === t ? "tc on" : "tc"}
            onClick={() => setF("type", filters.type === t ? "" : t)}
          >
            {TYPE_LABEL[t]} <b>{n}</b>
          </button>
        ))}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;

  .tc {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .tc.on {
    border-color: var(--accent);
    background: var(--accent-soft);
    color: var(--accent);
  }
  .tc b {
    font-family: var(--font-mono);
    color: var(--fg);
  }
`;
