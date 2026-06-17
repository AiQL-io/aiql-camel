"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { VERDICT_TONE } from "./profileHelpers.js";

export function ParentLine({ role, parent, check }) {
  return (
    <ParentRow>
      <div className="who">
        <div className="role">{role}</div>
        {parent ? (
          <Link href={`/registry/${parent.id}`}>
            {parent.name} · {parent.registrationId}
          </Link>
        ) : (
          <span className="none">Not recorded</span>
        )}
      </div>
      <div style={{ textAlign: "end" }}>
        {check ? (
          <>
            <Chip
              size="sm"
              tone={VERDICT_TONE[check.verdict]}
              style={{ textTransform: "capitalize" }}
            >
              {check.verdict}
            </Chip>
            <div className="verdict">
              {check.lociCompared} loci · {check.mismatchCount} mismatch
              {check.mismatchCount === 1 ? "" : "es"}
            </div>
          </>
        ) : (
          <Chip size="sm">no test</Chip>
        )}
      </div>
    </ParentRow>
  );
}

const ParentRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--separator);

  &:last-child {
    border-bottom: none;
  }
  .who .role {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fg-subtle);
  }
  .who a {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--accent);
  }
  .who .none {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .verdict {
    text-align: end;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 4px;
  }
`;
