"use client";

import React from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function AlertBulkBar({
  selected,
  setSelected,
  user,
  bulkAssign,
  bulkDismiss,
}) {
  return (
    <Wrap>
      <span className="n">{selected.size} selected</span>
      <button
        type="button"
        onClick={() => {
          bulkAssign([...selected], user.name);
          setSelected(new Set());
        }}
      >
        <Icon name="user" size={13} /> Assign to me
      </button>
      <button
        type="button"
        onClick={() => {
          const reason = prompt("Dismiss reason");
          if (reason) bulkDismiss([...selected], reason, user.name);
          setSelected(new Set());
        }}
      >
        <Icon name="x-circle" size={13} /> Dismiss
      </button>
      <button
        type="button"
        className="clear"
        onClick={() => setSelected(new Set())}
      >
        Clear
      </button>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 16px;
  background: var(--accent-soft);
  border: 1px solid var(--accent);
  border-radius: var(--radius-lg);

  .n {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--accent);
  }
  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface);
    color: var(--fg);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .clear {
    margin-inline-start: auto;
    border: none;
    background: transparent;
    color: var(--fg-subtle);
  }
`;
