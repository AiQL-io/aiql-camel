"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Card } from "@/imports/core/components/Card.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";

export function PreviewLanding({ module: m }) {
  return (
    <Root>
      <Link href="/" className="back">
        <Icon name="arrow-left" size={14} /> Command Center
      </Link>

      <div className="head">
        <span className="glyph">
          <Icon name={m.icon} size={26} />
        </span>
        <div>
          <Overline>Roadmap</Overline>
          <h1 className="title">{m.title}</h1>
        </div>
        <Chip tone="accent" className="phase-chip">
          {m.phase}
        </Chip>
      </div>

      <p className="lede">{m.desc}</p>

      <Card className="card">
        <Overline className="card-title">Planned capabilities</Overline>
        <div className="bullets">
          {m.bullets.map((b) => (
            <div key={b} className="bullet">
              <span className="bullet-icon">
                <Icon name="check-circle" size={18} />
              </span>
              <span className="bullet-text">{b}</span>
            </div>
          ))}
        </div>
      </Card>

      <p className="note">
        This module plugs into the same DNA identity spine and ships in{" "}
        {m.phase}. Preview only — not yet functional.
      </p>
    </Root>
  );
}

const Root = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 40px;

  .back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .head {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 20px;
  }
  .glyph {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-muted);
    color: var(--fg-secondary);
  }
  .title {
    font-size: var(--text-xl);
    font-weight: var(--weight-medium);
  }
  .phase-chip {
    margin-inline-start: auto;
  }
  .lede {
    color: var(--fg-secondary);
    font-size: var(--text-base);
    line-height: 24px;
    margin-top: 16px;
  }
  .card {
    margin-top: 20px;
  }
  .card-title {
    margin-bottom: 12px;
  }
  .bullets {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .bullet {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .bullet-icon {
    color: var(--accent);
    margin-top: 1px;
  }
  .bullet-text {
    font-size: var(--text-sm);
    line-height: 20px;
  }
  .note {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 16px;
  }
`;
