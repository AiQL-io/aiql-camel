"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";

const SEV = {
  high: { tone: "var(--danger)", icon: "warning" },
  medium: { tone: "var(--status-warning)", icon: "trend-down" },
  low: { tone: "var(--accent)", icon: "info" },
};

export function InsightCard({ insight }) {
  const s = SEV[insight.severity] || SEV.low;
  return (
    <Root $tone={s.tone}>
      <span className="ic">
        <Icon name={s.icon} size={15} />
      </span>
      <div className="body">
        <p className="title">{insight.title}</p>
        {insight.detail && <p className="detail">{insight.detail}</p>}
        {insight.href && (
          <Link className="cta" href={insight.href}>
            {insight.cta || "Investigate"} <Icon name="arrow-right" size={12} />
          </Link>
        )}
      </div>
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--border);
  border-inline-start: 3px solid ${(p) => p.$tone};
  border-radius: var(--radius-lg);
  background: var(--surface);

  .ic {
    color: ${(p) => p.$tone};
    margin-top: 1px;
  }
  .title {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    line-height: var(--leading-snug);
  }
  .detail {
    margin-top: 4px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .cta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: var(--text-xs);
    color: var(--accent);
  }
`;
