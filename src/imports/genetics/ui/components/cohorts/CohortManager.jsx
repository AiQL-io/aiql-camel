"use client";

import React from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { composition, relativeTime } from "./cohortsHelpers.js";

export function CohortManager({
  cohorts,
  access,
  breeds,
  selectedIds,
  onToggleCompare,
  onSetScope,
  onEdit,
  onDuplicate,
  onDelete,
  resolveAnimals,
}) {
  if (cohorts.length === 0) {
    return (
      <Empty>
        No saved cohorts yet. Create one by facets, or select animals on
        Structure, Relatedness, Inbreeding, or Clusters and save them as a
        cohort.
      </Empty>
    );
  }
  return (
    <List>
      {cohorts.map((c) => {
        const animals = resolveAnimals(c);
        const comp = composition(animals, breeds);
        const checked = selectedIds.includes(c.id);
        const small = animals.length < 30;
        return (
          <div className={`card${checked ? " on" : ""}`} key={c.id}>
            <label className="pick">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleCompare(c.id)}
              />
            </label>
            <div className="body">
              <div className="top">
                <b>{c.name}</b>
                <span className="n">
                  {animals.length.toLocaleString()} animals
                </span>
                {c.origin && <span className="src">{c.origin}</span>}
                {small && (
                  <span className="warn" title="Small cohort — low confidence">
                    <Icon name="warning" size={11} /> small
                  </span>
                )}
              </div>
              <div className="comp">
                {comp.label || "—"}
                {comp.regionLabel ? ` · ${comp.regionLabel}` : ""} ·{" "}
                {comp.profiled}% profiled
              </div>
              {c.created && (
                <div className="created">created {relativeTime(c.created)}</div>
              )}
            </div>
            <div className="acts">
              <button
                type="button"
                onClick={() => onSetScope(c.id)}
                title="Set as active scope"
              >
                <Icon name="target" size={13} /> Scope
              </button>
              <button
                type="button"
                onClick={() => onEdit(c)}
                title="Edit cohort"
              >
                <Icon name="pencil-simple" size={13} />
              </button>
              <button
                type="button"
                onClick={() => onDuplicate(c.id)}
                title="Duplicate as filter"
              >
                <Icon name="copy" size={13} />
              </button>
              <button
                type="button"
                className="del"
                onClick={() => onDelete(c.id)}
                title="Delete cohort"
              >
                <Icon name="trash" size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </List>
  );
}

const Empty = styled.p`
  font-size: var(--text-sm);
  color: var(--fg-subtle);
  padding: 8px 0;
  line-height: 1.6;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .card {
    display: grid;
    grid-template-columns: 28px 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
  }
  .card.on {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .pick {
    display: flex;
    align-items: center;
  }
  .top {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .top b {
    font-size: var(--text-sm);
  }
  .n {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-family: var(--font-mono);
  }
  .src {
    font-size: var(--text-xs);
    color: var(--accent);
    background: var(--accent-soft);
    padding: 1px 6px;
    border-radius: var(--radius-pill);
  }
  .warn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: var(--text-xs);
    color: var(--status-warning, var(--danger));
  }
  .comp {
    margin-top: 4px;
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .created {
    margin-top: 2px;
    font-size: 10px;
    color: var(--fg-subtle);
  }
  .acts {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .acts button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    padding: 5px 8px;
    border-radius: var(--radius-pill);
    cursor: pointer;
  }
  .acts button:hover {
    background: var(--surface-2);
  }
  .acts .del {
    color: var(--fg-subtle);
  }
  .acts .del:hover {
    color: var(--danger);
    border-color: var(--danger);
  }
`;
