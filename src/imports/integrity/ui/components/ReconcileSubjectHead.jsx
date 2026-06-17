"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function ReconcileSubjectHead({ subject }) {
  return (
    <>
      <Crumb>
        <Link href="/integrity">
          <Icon name="arrow-left" size={13} /> Alert Queue
        </Link>
        <span>/</span>
        <span className="cur">Reconciliation</span>
      </Crumb>

      <SubjectHead>
        <div>
          <Overline>
            Conflict resolution · biology is the source of truth
          </Overline>
          <h2>{subject.name}</h2>
          <Link className="reg" href={`/registry/${subject.id}`}>
            {subject.registrationId}
          </Link>
        </div>
        <div className="legend">
          <span>
            <i className="sw reg" /> Registry-declared
          </span>
          <span>
            <i className="sw bio" /> Biology-derived
          </span>
        </div>
      </SubjectHead>
    </>
  );
}

const Crumb = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-sm);
  color: var(--fg-subtle);
  a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--fg-subtle);
  }
  a:hover {
    color: var(--fg);
  }
  .cur {
    color: var(--fg);
  }
`;

const Overline = styled.span`
  display: block;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fg-subtle);
`;

const SubjectHead = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 14px;

  h2 {
    font-size: var(--text-xl);
    font-weight: var(--weight-medium);
    margin-top: 6px;
  }
  .reg {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--accent);
  }
  .legend {
    display: flex;
    gap: 16px;
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .sw {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }
  .sw.reg {
    background: var(--fg-muted);
  }
  .sw.bio {
    background: var(--accent);
  }
`;
