"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { BarList } from "@/imports/core/components/BarList.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { openMethod } from "@/imports/genetics/state/methodsStore.js";

function MethodBtn({ k, children }) {
  return (
    <button type="button" className="mlink" onClick={() => openMethod(k)}>
      {children} <Icon name="info" size={11} />
    </button>
  );
}

export function LocusDetail({ detail }) {
  const [specMode, setSpecMode] = useState("population");
  if (!detail) {
    return <Empty>Select a locus in the table to inspect its QC detail.</Empty>;
  }
  const spectrum =
    specMode === "observed" ? detail.obsSpectrum : detail.spectrum;
  const hwBars = [
    { label: "Het obs", value: detail.obsHet, c: "var(--aiql-bar-gradient)" },
    { label: "Het exp", value: detail.expHet, c: "var(--fg-muted)" },
    { label: "Hom obs", value: detail.obsHom, c: "var(--aiql-bar-gradient)" },
    { label: "Hom exp", value: detail.expHom, c: "var(--fg-muted)" },
  ];
  const hwMax = Math.max(...hwBars.map((b) => b.value), 1);
  const deviation = detail.he ? (detail.obsHo - detail.he).toFixed(3) : "0";

  return (
    <Root>
      <div className="title">
        <b>{detail.locus}</b>
        <span className="tier">tier {detail.tier}</span>
        {detail.lowConfidence && (
          <span className="lc" title="Sparse data in scope">
            <Icon name="warning" size={11} /> low-confidence (n={detail.typed})
          </span>
        )}
      </div>

      <div className="spechead">
        <h4>
          <MethodBtn k="he">Allele-frequency spectrum</MethodBtn>
        </h4>
        <div className="seg">
          <button
            type="button"
            className={specMode === "population" ? "on" : ""}
            onClick={() => setSpecMode("population")}
          >
            Population
          </button>
          <button
            type="button"
            className={specMode === "observed" ? "on" : ""}
            onClick={() => setSpecMode("observed")}
          >
            Observed (scope)
          </button>
        </div>
      </div>
      <BarList
        data={spectrum.map((s) => ({ label: s.allele, value: s.freq }))}
        color="var(--status-info, var(--accent))"
      />

      <h4>
        <MethodBtn k="hwe">HWE · observed vs expected genotypes</MethodBtn>
      </h4>
      <p className="gcount">
        Genotype counts (n = {detail.typed}): {detail.obsHet} heterozygous ·{" "}
        {detail.obsHom} homozygous.
      </p>
      <Hw>
        {hwBars.map((b) => (
          <div className="row" key={b.label}>
            <span className="l">{b.label}</span>
            <span className="track">
              <span
                className="fill"
                style={{
                  width: `${(b.value / hwMax) * 100}%`,
                  background: b.c,
                }}
              />
            </span>
            <span className="v">{b.value}</span>
          </div>
        ))}
        <p className="dev">
          Observed Ho {detail.obsHo} vs He {detail.he} (Δ {deviation}).
          {Math.abs(Number(deviation)) > 0.08
            ? " Heterozygote deficit — possible null alleles or substructure."
            : " Consistent with Hardy–Weinberg expectation."}
        </p>
      </Hw>

      <div className="stats">
        <Stat label="Typed" v={detail.typed} />
        <Stat
          label="% missing"
          v={`${detail.missingPct.toFixed(1)}%`}
          warn={detail.missingPct > 15}
        />
        <Stat
          label="PIC"
          v={detail.pic.toFixed(3)}
          warn={detail.pic < 0.4}
          method="pic"
        />
        <Stat label="PE" v={detail.pe.toFixed(3)} method="cpe" />
        <Stat label="Na" v={detail.na} method="na" />
      </div>
    </Root>
  );
}

function Stat({ label, v, warn, method }) {
  return (
    <div className="stat">
      {method ? (
        <button
          type="button"
          className="sl link"
          onClick={() => openMethod(method)}
        >
          {label} <Icon name="info" size={10} />
        </button>
      ) : (
        <span className="sl">{label}</span>
      )}
      <b className={warn ? "w" : ""}>{v}</b>
    </div>
  );
}

const Empty = styled.div`
  padding: 32px;
  text-align: center;
  color: var(--fg-subtle);
  font-size: var(--text-sm);
`;

const Root = styled.div`
  .title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .title b {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
  }
  .tier {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    background: var(--surface-2);
    padding: 1px 8px;
    border-radius: var(--radius-pill);
  }
  .lc {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: var(--text-xs);
    color: var(--status-warning, var(--danger));
  }
  h4 {
    margin: 16px 0 8px;
  }
  .spechead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .spechead h4 {
    margin: 16px 0 8px;
  }
  .seg {
    display: flex;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }
  .seg button {
    border: none;
    background: transparent;
    color: var(--fg-secondary);
    font-size: 10px;
    padding: 4px 8px;
    cursor: pointer;
  }
  .seg button.on {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .gcount {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
    margin-bottom: 10px;
  }
  .sl.link {
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  .sl.link:hover {
    color: var(--accent);
  }
  .mlink {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
    padding: 0;
  }
  .mlink:hover {
    color: var(--accent);
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: 10px;
    margin-top: 16px;
  }
  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
  }
  .stat .sl {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .stat b {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }
  .stat b.w {
    color: var(--danger);
  }
`;

const Hw = styled.div`
  .row {
    display: grid;
    grid-template-columns: 64px 1fr 40px;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
  }
  .row .l {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .track {
    height: 10px;
    background: var(--surface-2);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }
  .fill {
    display: block;
    height: 100%;
    transform-origin: left center;
    animation: aiql-grow-x 720ms cubic-bezier(0.2, 0.75, 0.25, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    .fill {
      animation: none;
    }
  }
  .row .v {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-align: end;
  }
  .dev {
    margin-top: 8px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    line-height: 1.5;
  }
`;
