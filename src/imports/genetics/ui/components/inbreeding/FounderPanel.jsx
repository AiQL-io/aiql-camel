"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function FounderPanel({ founders }) {
  const max = Math.max(...founders.map((f) => f.meanKinship), 0.01);
  return (
    <Root>
      <p className="lead">
        These animals contribute most to overall relatedness — the input to
        optimal-contribution / corrective-mating decisions.
      </p>
      {founders.map((f, i) => (
        <div className="row" key={f.id}>
          <span className="rank">{i + 1}</span>
          <div className="who">
            <Link href={`/registry/${f.id}`} className="reg">
              {f.reg}
            </Link>
            <span className="meta">
              {f.breed} · {f.region} · {f.relatives} relatives
            </span>
          </div>
          <span className="track">
            <span
              className="bar"
              style={{ width: `${(f.meanKinship / max) * 100}%` }}
            />
          </span>
          <span className="kin">{f.meanKinship.toFixed(3)}</span>
          <Link
            className="net"
            href={`/verify/relationship?focal=${f.id}`}
            title="View relatives"
          >
            <Icon name="graph" size={13} />
          </Link>
        </div>
      ))}
      <button type="button" className="advisor" disabled title="Tier 2">
        <Icon name="flask" size={13} /> Send selection to Breeding Advisor
        (phase 2)
      </button>
    </Root>
  );
}

const Root = styled.div`
  .lead {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-bottom: 12px;
    line-height: var(--leading-normal);
  }
  .row {
    display: grid;
    grid-template-columns: 20px 1fr 90px 44px 22px;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px solid var(--separator);
  }
  .rank {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .who {
    min-width: 0;
  }
  .reg {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .meta {
    display: block;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .track {
    height: 6px;
    border-radius: var(--radius-pill);
    background: var(--surface-2);
    overflow: hidden;
  }
  .bar {
    display: block;
    height: 100%;
    background: var(--aiql-bar-gradient);
    transform-origin: left center;
    animation: aiql-grow-x 720ms cubic-bezier(0.2, 0.75, 0.25, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    .bar {
      animation: none;
    }
  }
  .kin {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg);
    text-align: end;
  }
  .net {
    color: var(--fg-subtle);
  }
  .net:hover {
    color: var(--accent);
  }
  .advisor {
    margin-top: 14px;
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 34px;
    border: 1px dashed var(--border);
    border-radius: var(--radius-lg);
    background: transparent;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    cursor: not-allowed;
  }
`;
