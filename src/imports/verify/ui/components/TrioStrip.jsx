"use client";

import React from "react";
import styled from "styled-components";

export function TrioStrip({ rows = [], labels = {} }) {
  const violations = rows.filter((r) => r.status === "violation").length;

  const cell = (pair, highlight, color) =>
    pair.map((a, i) => (
      <span
        key={i}
        className="al"
        style={a === highlight ? { color, fontWeight: 600 } : undefined}
      >
        {a}
      </span>
    ));

  return (
    <Wrap>
      <div className="scroll">
        <Grid $cols={rows.length}>
          <div className="corner" />
          {rows.map((r) => (
            <div
              key={`h-${r.locus}`}
              className={`loc ${r.status === "violation" ? "opp" : ""}`}
            >
              {r.locus}
            </div>
          ))}

          <div className="track">{labels.sire || "Sire"}</div>
          {rows.map((r) => (
            <div
              key={`s-${r.locus}`}
              className={`cell ${r.status === "violation" ? "opp" : ""}`}
            >
              {cell(r.sire, r.fromSire, "var(--accent)")}
            </div>
          ))}

          <div className="track off">{labels.offspring || "Offspring"}</div>
          {rows.map((r) => (
            <div
              key={`o-${r.locus}`}
              className={`cell off ${r.status === "violation" ? "opp" : ""}`}
            >
              <span
                className="al"
                style={
                  r.fromSire != null
                    ? { color: "var(--accent)", fontWeight: 600 }
                    : undefined
                }
              >
                {r.offspring[0]}
              </span>
              <span
                className="al"
                style={
                  r.fromDam != null
                    ? { color: "var(--teal, #0FB5AE)", fontWeight: 600 }
                    : undefined
                }
              >
                {r.offspring[1]}
              </span>
              {r.status === "violation" && r.implicated && (
                <span className="imp">{r.implicated}</span>
              )}
            </div>
          ))}

          <div className="track">{labels.dam || "Dam"}</div>
          {rows.map((r) => (
            <div
              key={`d-${r.locus}`}
              className={`cell ${r.status === "violation" ? "opp" : ""}`}
            >
              {cell(r.dam, r.fromDam, "var(--teal, #0FB5AE)")}
            </div>
          ))}
        </Grid>
      </div>

      <Summary>
        <span>
          <b>{rows.length}</b> loci
        </span>
        <span className={violations > 0 ? "bad" : ""}>
          <b>{violations}</b> Mendelian violation{violations === 1 ? "" : "s"}
        </span>
        <span className="legend">
          <i className="sw" style={{ background: "var(--accent)" }} /> from sire
          <i
            className="sw"
            style={{ background: "var(--teal, #0FB5AE)", marginInlineStart: 8 }}
          />{" "}
          from dam
          <i
            className="sw"
            style={{ background: "var(--danger)", marginInlineStart: 8 }}
          />{" "}
          violation
        </span>
      </Summary>
    </Wrap>
  );
}

const Wrap = styled.div`
  .scroll {
    overflow-x: auto;
    padding-bottom: 4px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 110px repeat(${(p) => p.$cols}, minmax(54px, 1fr));
  gap: 4px;
  min-width: max-content;

  .loc {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--fg-subtle);
    text-align: center;
    padding: 2px 0;
    white-space: nowrap;
  }
  .loc.opp {
    color: var(--danger);
  }
  .track {
    display: flex;
    align-items: center;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .track.off {
    color: var(--accent);
  }
  .cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 2px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    position: relative;
  }
  .cell.off {
    background: var(--surface-2);
  }
  .cell.opp {
    border-color: var(--danger);
    background: color-mix(in srgb, var(--danger) 8%, var(--surface));
  }
  .al {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .imp {
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--danger);
  }
`;

const Summary = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  font-size: var(--text-xs);
  color: var(--fg-secondary);
  flex-wrap: wrap;

  b {
    font-family: var(--font-mono);
    color: var(--fg);
  }
  .bad b {
    color: var(--danger);
  }
  .legend {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--fg-subtle);
    margin-inline-start: auto;
  }
  .sw {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    display: inline-block;
  }
`;
