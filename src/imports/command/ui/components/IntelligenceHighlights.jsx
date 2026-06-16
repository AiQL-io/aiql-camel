"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { SectionCard } from "./SectionCard.jsx";
import { ALERTS, SEV_TONE, ACTIVITY } from "./data.js";

export function IntelligenceHighlights({ executive }) {
  return (
    <Row $executive={executive}>
      <SectionCard
        title="Integrity alerts"
        action={<Link href="/integrity">View all →</Link>}
      >
        <AlertList>
          {ALERTS.slice(0, executive ? 3 : 5).map((a, i) => (
            <Link key={i} href="/integrity">
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
        </AlertList>
      </SectionCard>

      <SectionCard
        title="Over-related clusters"
        action={<Link href="/genetics">Cluster detection →</Link>}
      >
        <Clusters>
          <div className="count">
            <b>14</b>
            <span>clusters detected</span>
          </div>
          <Link href="/genetics" className="largest">
            <Overline>Largest cluster</Overline>
            <div className="name">Majaheem · Stable 7</div>
            <div className="stat">38 animals · mean r 0.31</div>
          </Link>
        </Clusters>
      </SectionCard>

      {!executive && (
        <SectionCard title="Activity">
          <Feed>
            {ACTIVITY.map((a, i) => (
              <Link key={i} href={a.href}>
                <span className="ic">
                  <Icon name={a.icon} size={16} />
                </span>
                <span className="text">
                  <b>{a.text}</b>
                  <span>{a.time} ago</span>
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
  grid-template-columns: ${(p) => (p.$executive ? "1fr 1fr" : "1fr 1fr 1fr")};
  gap: 16px;
  margin-top: 16px;
`;

const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  a {
    display: flex;
    align-items: flex-start;
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
`;

const Feed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  a {
    display: flex;
    align-items: flex-start;
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
