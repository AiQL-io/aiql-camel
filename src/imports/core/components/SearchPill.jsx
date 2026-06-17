"use client";

import React from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function SearchPill({ placeholder, onClick }) {
  return (
    <Pill type="button" onClick={onClick}>
      <Icon name="magnifying-glass" size={16} color="var(--fg-subtle)" />
      <span className="text">{placeholder}</span>
      <kbd>⌘K</kbd>
    </Pill>
  );
}

const Pill = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 300px;
  height: 36px;
  padding: 0 8px 0 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  color: var(--fg-subtle);
  cursor: text;
  text-align: start;

  .text {
    flex: 1;
    font-size: var(--text-sm);
    color: var(--fg-subtle);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  kbd {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    background: var(--bg-muted);
    border: 1px solid var(--border);
    border-radius: var(--radius-xs);
    padding: 1px 6px;
  }
`;
