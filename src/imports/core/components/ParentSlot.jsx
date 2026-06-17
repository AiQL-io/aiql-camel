"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";

export function ParentSlot({ role, slot }) {
  const { biology, registry, conflict } = slot;
  if (!biology && !registry)
    return (
      <Slot>
        <span className="role">{role}</span>
        <div className="card none">Not recorded</div>
      </Slot>
    );
  if (conflict)
    return (
      <Slot>
        <span className="role">{role}</span>
        <Link href={`/registry/${registry.id}`} className="card registry">
          <span className="tag">Registry</span>
          {registry.name}
        </Link>
        <Link href={`/registry/${biology.id}`} className="card biology">
          <span className="tag ok">Biology</span>
          {biology.name}
        </Link>
      </Slot>
    );
  const node = biology || registry;
  return (
    <Slot>
      <span className="role">{role}</span>
      <Link
        href={`/registry/${node.id}`}
        className={`card ${biology ? "biology" : "registry"}`}
      >
        <span className={`tag ${biology ? "ok" : ""}`}>
          {biology ? "Biology" : "Registry"}
        </span>
        {node.name}
      </Link>
    </Slot>
  );
}

const Slot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  .role {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fg-subtle);
  }
  .card {
    position: relative;
    display: block;
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    font-size: var(--text-sm);
    color: var(--fg);
  }
  .card.none {
    color: var(--fg-subtle);
    border-style: dashed;
  }
  .card.registry {
    border-style: dashed;
  }
  .card.biology {
    border-color: var(--separator-2);
  }
  .card .tag {
    display: inline-block;
    margin-inline-end: 8px;
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .card .tag.ok {
    color: var(--status-success);
  }
`;
