"use client";

import React from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { clusterColor } from "./ClusterNetwork.jsx";

export function ClusterList({ clusters, selected, onSelect, onViewMembers }) {
  return (
    <Root>
      <div className="scroll">
        {clusters.map((c) => (
          <div
            key={c.id}
            role="button"
            tabIndex={0}
            className={`card${selected === c.id ? " on" : ""}`}
            onClick={() => onSelect(c.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(c.id);
              }
            }}
          >
            <div className="top">
              <span
                className="dot"
                style={{ background: clusterColor(c.id) }}
              />
              <b>Cluster {c.id + 1}</b>
              <span className="size">{c.size} animals</span>
            </div>
            <div className="metrics">
              <span>
                mean r <b>{c.meanR.toFixed(2)}</b>
              </span>
              <span>
                mean F <b>{c.meanF.toFixed(2)}</b>
              </span>
              <span>
                {c.lineMix[0].breed}
                {c.lineMix.length > 1 ? ` +${c.lineMix.length - 1}` : ""}
              </span>
            </div>
            <div className="conc">
              <Icon name="map-pin" size={11} /> {c.regionConc.key} (
              {c.regionConc.pct}%) · {c.ownerConc.key} ({c.ownerConc.pct}%)
            </div>
            <div className="actions">
              <button
                type="button"
                className="act"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewMembers) onViewMembers(c.id);
                  else onSelect(c.id);
                }}
              >
                <Icon name="users-three" size={12} /> View members
              </button>
              <span className="act tier2" title="Tier 2">
                <Icon name="flask" size={12} /> Breeding Advisor
              </span>
            </div>
          </div>
        ))}
      </div>
    </Root>
  );
}

const Root = styled.div`
  position: relative;
  flex: 1;
  min-height: 240px;

  .scroll {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
  }

  .card {
    text-align: start;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
    padding: 12px;
    cursor: pointer;
  }
  .card:hover {
    background: var(--surface-2);
  }
  .card.on {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .top {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .top b {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .size {
    margin-inline-start: auto;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-family: var(--font-mono);
  }
  .metrics {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .metrics b {
    font-family: var(--font-mono);
    color: var(--fg);
  }
  .conc {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .actions {
    display: flex;
    gap: 12px;
    margin-top: 10px;
  }
  .act {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs);
    color: var(--accent);
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
  }
  button.act:hover {
    text-decoration: underline;
  }
  .act.tier2 {
    color: var(--fg-subtle);
  }
`;
