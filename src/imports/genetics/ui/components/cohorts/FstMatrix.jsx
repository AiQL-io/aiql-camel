"use client";

import React from "react";
import styled from "styled-components";
import { openMethod } from "@/imports/genetics/state/methodsStore.js";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { FST_BAND_LABEL } from "./cohortsHelpers.js";

const BAND_COLOR = {
  negligible: "var(--status-success)",
  moderate: "var(--status-warning, #b8860b)",
  great: "var(--danger)",
};

function cellBg(cell) {
  if (cell.band === "self") return "var(--surface-2)";
  const t = Math.min(1, cell.value / 0.2);
  return `color-mix(in srgb, var(--danger) ${Math.round(t * 70 + 8)}%, var(--surface))`;
}

export function FstMatrix({ metrics, fstMatrix }) {
  return (
    <Root>
      <div className="grid" style={{ "--n": metrics.length }}>
        <span className="corner" />
        {metrics.map((m) => (
          <span className="ch" key={`h${m.id}`} title={m.name}>
            {m.name.slice(0, 6)}
          </span>
        ))}
        {metrics.map((row, i) => (
          <React.Fragment key={row.id}>
            <span className="rh" title={row.name}>
              {row.name.slice(0, 6)}
            </span>
            {metrics.map((col, j) => {
              const cell = fstMatrix[i][j];
              return (
                <span
                  key={col.id}
                  className="cell"
                  style={{ background: cellBg(cell) }}
                  title={
                    cell.band === "self"
                      ? "same cohort"
                      : `${row.name} ↔ ${col.name}: F_ST ${cell.value.toFixed(3)} ± ${cell.ci} (${FST_BAND_LABEL[cell.band]})`
                  }
                >
                  {cell.band === "self" ? (
                    "—"
                  ) : (
                    <>
                      <b>{cell.value.toFixed(2)}</b>
                      <em>±{cell.ci}</em>
                    </>
                  )}
                </span>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="key">
        {["negligible", "moderate", "great"].map((b) => (
          <span key={b}>
            <i style={{ background: BAND_COLOR[b] }} /> {FST_BAND_LABEL[b]}
          </span>
        ))}
        <button type="button" onClick={() => openMethod("fst")}>
          <Icon name="info" size={12} /> Method
        </button>
      </div>
    </Root>
  );
}

const Root = styled.div`
  .grid {
    display: grid;
    grid-template-columns: 56px repeat(var(--n), 1fr);
    gap: 3px;
    font-size: var(--text-xs);
  }
  .ch,
  .rh {
    font-family: var(--font-mono);
    color: var(--fg-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .cell {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    border: 1px solid var(--separator);
    font-family: var(--font-mono);
    color: var(--fg);
  }
  .cell b {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .cell em {
    font-style: normal;
    font-size: 9px;
    color: var(--fg-secondary);
  }
  .key {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 12px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .key span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .key i {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }
  .key button {
    margin-inline-start: auto;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    color: var(--accent);
    font-size: var(--text-xs);
    cursor: pointer;
  }
`;
