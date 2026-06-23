"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { SectionCard } from "./SectionCard.jsx";
import { SEV_TONE } from "./data.js";

export function IntelligenceHighlights({
  executive,
  alerts = [],
  clusters,
  activity = [],
}) {
  return (
    <Row $executive={executive}>
      <SectionCard
        title="Integrity alerts"
        action={<Link href="/integrity">View all →</Link>}
      >
        <AlertList>
          {alerts.slice(0, executive ? 3 : 5).map((a) => (
            <Link key={a.id} href={`/registry/${a.id}`}>
              <Chip tone={SEV_TONE[a.sev]} size="sm">
                {a.sev}
              </Chip>
              <span>
                <span className="type">{a.type}</span>
                <span className="meta">
                  {a.subject} · {a.detail}
                </span>
              </span>
            </Link>
          ))}
          {alerts.length === 0 && (
            <span className="empty">No open integrity alerts.</span>
          )}
        </AlertList>
      </SectionCard>

      <SectionCard
        title="Over-related clusters"
        action={<Link href="/genetics">Cluster detection →</Link>}
      >
        <Clusters>
          <div className="count">
            <b>{clusters?.count ?? 0}</b>
            <span>over-related clusters</span>
          </div>
          {clusters?.largest ? (
            <Link href="/genetics" className="largest">
              <Overline>Largest cluster</Overline>
              <div className="name">{clusters.largest.owner?.name}</div>
              <div className="stat">
                {clusters.largest.size} animals · mean F{" "}
                {clusters.largest.meanF}
              </div>
            </Link>
          ) : (
            <div className="none">
              No over-related clusters above threshold.
            </div>
          )}
        </Clusters>
      </SectionCard>

      {!executive && (
        <SectionCard title="Activity">
          <Feed>
            {activity.map((a, i) => (
              <Link key={i} href={a.href}>
                <span className="ic">
                  <Icon name={a.icon} size={16} />
                </span>
                <span className="text">
                  <b>{a.text}</b>
                  <span>{a.sub}</span>
                </span>
              </Link>
            ))}
          </Feed>
        </SectionCard>
      )}
    </Row>
  );
}

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  align-items: start;
  gap: 16px;
  margin-top: 16px;
`;

const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  a {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  a > :first-child {
    text-transform: capitalize;
    flex: none;
  }
  a > :last-child {
    min-width: 0;
  }
  .type {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .meta {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .empty {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
`;

const Clusters = styled.div`
  .count {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .count b {
    font-size: 32px;
    font-weight: var(--weight-medium);
  }
  .count span {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .largest {
    display: block;
    margin-top: 14px;
    padding: 12px;
    background: var(--bg-muted);
    border-radius: var(--radius-md);
  }
  .largest .name {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .largest .stat {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 4px;
  }
  .none {
    margin-top: 14px;
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
`;

const Feed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  a {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ic {
    color: var(--fg-subtle);
    margin-top: 1px;
  }
  .text {
    min-width: 0;
    flex: 1;
  }
  .text b {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--weight-regular);
    line-height: 18px;
  }
  .text span {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 2px;
  }
`;
