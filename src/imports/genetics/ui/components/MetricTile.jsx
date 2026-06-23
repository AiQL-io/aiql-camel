"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Sparkline } from "@/imports/core/components/Sparkline.jsx";
import { useContainerWidth } from "@/imports/core/components/charts/useChartSize.js";
import { openMethod } from "@/imports/genetics/state/methodsStore.js";

export function MetricTile({
  label,
  value,
  unit,
  ci,
  loci,
  band,
  delta,
  deltaTone = "neutral",
  spark,
  methodKey,
  href,
  onClick,
}) {
  const clickable = Boolean(href || onClick);
  const [sparkRef, sparkW] = useContainerWidth();
  return (
    <Root $clickable={clickable} interactive={clickable} onClick={onClick}>
      <div className="head">
        <span className="label">{label}</span>
        {methodKey && (
          <button
            type="button"
            className="info"
            aria-label={`Method: ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              openMethod(methodKey);
            }}
          >
            <Icon name="info" size={13} />
          </button>
        )}
      </div>
      <div className="value">
        <b>{value}</b>
        {unit && <span className="unit">{unit}</span>}
        {band && <span className="band">{band}</span>}
      </div>
      <div className="meta">
        {ci != null && <span className="ci">± {ci}</span>}
        {loci != null && <span>{loci} loci</span>}
        {delta && <span className={`delta ${deltaTone}`}>{delta}</span>}
      </div>
      {spark && spark.length > 1 && (
        <div className="spark" ref={sparkRef}>
          {sparkW > 0 && <Sparkline data={spark} width={sparkW} height={44} />}
        </div>
      )}
    </Root>
  );
}

const Root = styled(Card)`
  padding: 16px;
  cursor: ${(p) => (p.$clickable ? "pointer" : "default")};
  display: flex;
  flex-direction: column;

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .label {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .info {
    border: none;
    background: transparent;
    color: var(--fg-subtle);
    cursor: pointer;
    display: inline-flex;
    padding: 2px;
  }
  .info:hover {
    color: var(--accent);
  }
  .value {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-top: 8px;
  }
  .value b {
    font-size: var(--text-2xl);
    font-weight: var(--weight-medium);
  }
  .unit {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .band {
    margin-inline-start: 2px;
    font-size: var(--text-xs);
    color: var(--accent);
    background: var(--accent-soft);
    padding: 1px 8px;
    border-radius: var(--radius-pill);
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 6px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-family: var(--font-mono);
  }
  .delta.up {
    color: var(--status-success);
  }
  .delta.down {
    color: var(--danger);
  }
  .spark {
    width: 100%;
    margin-top: auto;
    padding-top: 12px;
  }
  .spark svg {
    display: block;
  }
`;
