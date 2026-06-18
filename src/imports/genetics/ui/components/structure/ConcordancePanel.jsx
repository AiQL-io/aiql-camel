"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function ConcordancePanel({ concordance }) {
  const { score, matrix, breeds, outliers } = concordance;
  const maxCell = Math.max(
    1,
    ...breeds.flatMap((b) => breeds.map((g) => matrix[b][g])),
  );
  return (
    <Root>
      <div className="score">
        <b>{score}%</b>
        <span>declared ↔ genetic concordance</span>
      </div>

      <p className={`signal ${score >= 80 ? "strong" : "weak"}`}>
        <Icon name={score >= 80 ? "info" : "warning"} size={13} />
        {score >= 80
          ? "Strong genetic structure: declared lines separate cleanly in marker space, so line assignments are well supported by the genotypes."
          : "Weak genetic structure: declared lines largely overlap in marker space. Cluster boundaries are soft — interpret line assignments as gradients, not hard partitions."}
      </p>

      <h4>Confusion matrix · declared (rows) × genetic (cols)</h4>
      <div className="matrix" style={{ "--n": breeds.length }}>
        <span className="corner" />
        {breeds.map((g) => (
          <span className="ch" key={`h${g}`} title={g}>
            {g.slice(0, 3)}
          </span>
        ))}
        {breeds.map((b) => (
          <React.Fragment key={b}>
            <span className="rh" title={b}>
              {b.slice(0, 3)}
            </span>
            {breeds.map((g) => {
              const v = matrix[b][g];
              const diag = b === g;
              const intensity = v / maxCell;
              return (
                <span
                  key={b + g}
                  className={`cell${diag ? " diag" : v ? " off" : ""}`}
                  style={{
                    background: v
                      ? `color-mix(in srgb, var(${diag ? "--status-success" : "--danger"}) ${Math.round(
                          intensity * 70 + 10,
                        )}%, var(--surface))`
                      : "var(--surface)",
                  }}
                  title={`${b} → ${g}: ${v}`}
                >
                  {v || ""}
                </span>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <h4>
        Outliers <span className="n">{outliers.length}</span>
      </h4>
      <p className="sub">
        Declared line contradicts genetic placement — candidates for a
        registry/biology integrity alert.
      </p>
      <div className="outliers">
        {outliers.slice(0, 12).map((o) => (
          <div className="row" key={o.id}>
            <Link className="reg" href={`/registry/${o.id}`}>
              {o.reg}
            </Link>
            <span className="mismatch">
              {o.declaredBreed} <Icon name="arrow-right" size={11} />{" "}
              <b>{o.geneticBreed}</b>
            </span>
            <Link className="flag" href={`/integrity?subject=${o.id}`}>
              <Icon name="flag" size={12} /> Flag
            </Link>
          </div>
        ))}
        {outliers.length === 0 && (
          <p className="sub">No genetic-vs-declared outliers in this scope.</p>
        )}
      </div>
    </Root>
  );
}

const Root = styled.div`
  .score {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
  }
  .score b {
    font-size: var(--text-2xl);
    font-weight: var(--weight-medium);
  }
  .score span {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .signal {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: var(--text-xs);
    line-height: 1.5;
    padding: 8px 10px;
    border-radius: var(--radius-md);
    margin-bottom: 16px;
  }
  .signal.weak {
    color: var(--fg-secondary);
    background: var(--surface-2);
  }
  .signal.strong {
    color: var(--fg-secondary);
    background: var(--accent-soft);
  }
  h4 {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
    margin: 16px 0 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  h4 .n {
    font-family: var(--font-mono);
    color: var(--danger);
  }
  .matrix {
    display: grid;
    grid-template-columns: 36px repeat(var(--n), 1fr);
    gap: 2px;
    font-size: var(--text-xs);
  }
  .ch,
  .rh {
    font-family: var(--font-mono);
    color: var(--fg-subtle);
    text-align: center;
    align-self: center;
  }
  .cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    font-family: var(--font-mono);
    border: 1px solid var(--separator);
  }
  .sub {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-bottom: 8px;
  }
  .outliers {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 220px;
    overflow-y: auto;
  }
  .row {
    display: grid;
    grid-template-columns: 110px 1fr auto;
    align-items: center;
    gap: 8px;
    font-size: var(--text-xs);
  }
  .row .reg {
    font-family: var(--font-mono);
    color: var(--accent);
  }
  .mismatch {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--fg-secondary);
  }
  .mismatch b {
    color: var(--danger);
  }
  .flag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    color: var(--fg-subtle);
  }
  .flag:hover {
    color: var(--danger);
  }
`;
