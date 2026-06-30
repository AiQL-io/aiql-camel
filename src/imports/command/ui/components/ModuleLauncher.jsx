"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { ROADMAP } from "@/imports/core/components/roadmap.js";
import { LIVE_MODULES } from "./data.js";

export function ModuleLauncher() {
  return (
    <Section>
      <h2>Where would you like to work today?</h2>

      <Grid $min={300}>
        {LIVE_MODULES.map((m) => (
          <ModuleCard
            key={m.href}
            href={m.href}
            style={{ "--mc-accent": m.accent || "var(--accent)" }}
          >
            <div className="inner">
              <div className="top">
                <span className="ic">
                  <Icon name={m.icon} size={20} color="var(--mc-accent)" />
                </span>
                <span className="n">{m.n}</span>
              </div>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </div>
          </ModuleCard>
        ))}
      </Grid>

      <Overline className="roadmap-label">On the roadmap</Overline>
      <Grid $min={260} $flush>
        {ROADMAP.map((m) => (
          <RoadmapCard key={m.slug}>
            <div className="top">
              <Icon name={m.icon} size={20} />
              <Chip size="sm">{m.phase}</Chip>
            </div>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
            <Link href={`/preview/${m.slug}`} className="preview">
              Preview <Icon name="arrow-right" size={12} />
            </Link>
          </RoadmapCard>
        ))}
      </Grid>
    </Section>
  );
}

const Section = styled.div`
  margin-top: 28px;

  h2 {
    font-size: var(--text-xl);
    line-height: 28px;
    font-weight: var(--weight-semibold);
  }
  .roadmap-label {
    margin-top: 28px;
    margin-bottom: 14px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(${(p) => p.$min || 300}px, 1fr)
  );
  gap: 16px;
  margin-top: ${(p) => (p.$flush ? 0 : 20)}px;
`;

const ModuleCard = styled(Link)`
  display: block;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-inline-start: 5px solid var(--mc-accent);
  border-radius: var(--radius-lg);
  transition:
    box-shadow 140ms ease,
    border-color 140ms ease,
    transform 140ms ease;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--separator-2);
    border-inline-start-color: var(--mc-accent);
    transform: translateY(-2px);
  }

  .inner {
    padding: 20px 22px;
  }
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .ic {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--mc-accent) 12%, transparent);
  }
  .n {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--mc-accent);
  }
  h3 {
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    margin-top: 16px;
  }
  p {
    font-size: var(--text-base);
    color: var(--fg-secondary);
    line-height: 22px;
    margin-top: 8px;
  }
`;

const RoadmapCard = styled.div`
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 18px;

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--fg-subtle);
  }
  h3 {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    margin-top: 12px;
    color: var(--fg-secondary);
  }
  p {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    line-height: 16px;
    margin-top: 6px;
  }
  .preview {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 14px;
    height: 28px;
    padding: 0 12px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    color: var(--fg-secondary);
    font-size: var(--text-xs);
  }
`;
