"use client";

import React from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";

const META = {
  consistent: { tone: "success", icon: "check-circle", label: "Consistent" },
  excluded: { tone: "danger", icon: "x-circle", label: "Excluded" },
  inconclusive: { tone: "warning", icon: "warning", label: "Inconclusive" },
  "insufficient-loci": {
    tone: "default",
    icon: "minus-circle",
    label: "Insufficient loci",
  },
};

function statement(v, { lociCompared, mismatchCount, cpe, tolerance }) {
  if (v === "consistent")
    return `Not excluded across ${lociCompared} informative loci (panel exclusion power ${fmtCpe(cpe)}). A non-exclusion is supporting evidence, not proof.`;
  if (v === "excluded")
    return `${mismatchCount} opposition loci exceed the mutation/error tolerance (${tolerance}). This is a definitive Mendelian exclusion.`;
  if (v === "inconclusive")
    return `${mismatchCount} mismatch${mismatchCount === 1 ? "" : "es"} within tolerance — possible mutation, null allele, or genotyping error. Consider a trio or re-test before concluding.`;
  return `Too few shared typed loci (${lociCompared}) to return a confident verdict.`;
}

function fmtCpe(cpe) {
  if (!cpe && cpe !== 0) return "—";
  return cpe >= 0.9999 ? cpe.toFixed(5) : cpe.toFixed(4);
}

export function Verdict({
  verdict,
  lociCompared,
  mismatchCount,
  cpe,
  parentageIndex,
  tolerance = 1,
  onMethods,
}) {
  const m = META[verdict] || META["insufficient-loci"];
  return (
    <Root $tone={m.tone}>
      <div className="head">
        <div className="badge">
          <Icon name={m.icon} size={18} />
          {m.label}
        </div>
        {onMethods && (
          <button type="button" className="methods" onClick={onMethods}>
            <Icon name="info" size={14} /> Methods
          </button>
        )}
      </div>
      <div className="stats">
        <Stat k="Loci compared" v={lociCompared ?? "—"} />
        <Stat k="Mismatches" v={mismatchCount ?? "—"} onInfo={onMethods} />
        <Stat k="Exclusion power (CPE)" v={fmtCpe(cpe)} onInfo={onMethods} />
        {parentageIndex != null && parentageIndex > 0 && (
          <Stat
            k="Parentage index"
            v={parentageIndex.toExponential(2)}
            onInfo={onMethods}
          />
        )}
        <Stat k="Tolerance" v={tolerance} onInfo={onMethods} />
      </div>
      <p className="conf">
        {statement(verdict, { lociCompared, mismatchCount, cpe, tolerance })}
      </p>
    </Root>
  );
}

function Stat({ k, v, onInfo }) {
  return (
    <div className="stat">
      <span className="k">
        {k}
        {onInfo && (
          <button
            type="button"
            className="info"
            onClick={onInfo}
            aria-label={`Methods: ${k}`}
          >
            <Icon name="info" size={11} />
          </button>
        )}
      </span>
      <span className="v">{v}</span>
    </div>
  );
}

const TONE = {
  success: "var(--status-success)",
  danger: "var(--danger)",
  warning: "var(--status-warning)",
  default: "var(--fg-subtle)",
};

const Root = styled.div`
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  overflow: hidden;

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);
    background: ${(p) =>
      `color-mix(in srgb, ${TONE[p.$tone]} 8%, var(--surface))`};
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
    color: ${(p) => TONE[p.$tone]};
  }
  .methods {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding: 16px 18px;
  }
  .stat .k {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .stat .k .info {
    display: inline-flex;
    border: none;
    background: transparent;
    color: var(--fg-muted);
    cursor: pointer;
    padding: 0;
  }
  .stat .k .info:hover {
    color: var(--accent);
  }
  .stat .v {
    display: block;
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
    margin-top: 3px;
    font-family: var(--font-mono);
  }
  .conf {
    padding: 0 18px 16px;
    font-size: var(--text-sm);
    color: var(--fg-secondary);
    line-height: 20px;
  }
`;
