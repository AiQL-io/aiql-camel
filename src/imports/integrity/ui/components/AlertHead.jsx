"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { TYPE_LABEL } from "@/imports/integrity/state/alertStore.js";
import { SEV_TONE, STATUS_TONE } from "./alertConstants.js";

export function AlertHead({ alert }) {
  return (
    <>
      <Crumb>
        <Link href="/integrity">
          <Icon name="arrow-left" size={13} /> Alert Queue
        </Link>
        <span className="id">{alert.id}</span>
      </Crumb>

      <Head>
        <div className="title">
          <CapChip tone={SEV_TONE[alert.severity]}>{alert.severity}</CapChip>
          <h2>{TYPE_LABEL[alert.type]}</h2>
        </div>
        <div className="meta">
          <CapChip size="sm" tone={STATUS_TONE[alert.status]}>
            {alert.status.replace("_", " ")}
          </CapChip>
          <span className="det">Detected {alert.detectedAt?.slice(0, 10)}</span>
          <span className="det">
            {alert.assignee ? `Assigned to ${alert.assignee}` : "Unassigned"}
          </span>
        </div>
      </Head>
    </>
  );
}

const CapChip = styled(Chip)`
  text-transform: capitalize;
`;

const Crumb = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  a:hover {
    color: var(--fg);
  }
  .id {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-muted);
  }
`;

const Head = styled.div`
  margin-top: 14px;
  .title {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .title h2 {
    font-size: var(--text-xl);
    font-weight: var(--weight-medium);
    letter-spacing: -0.01em;
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
  }
  .det {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;
