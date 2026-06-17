"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
export function AlertAnimals({ alert, subject, related }) {
  return (
    <Card>
      <SectionTitle>
        <Icon name="paw-print" size={15} /> Animals involved
      </SectionTitle>
      <Animals>
        {subject ? (
          <Link className="animal" href={`/registry/${subject.id}`}>
            <span className="role">Subject</span>
            <span className="reg">{subject.registrationId}</span>
            <span className="nm">{subject.name}</span>
          </Link>
        ) : (
          <div className="animal none">
            <span className="role">Subject</span>
            <span className="nm">Panel-level alert (no single animal)</span>
          </div>
        )}
        {related.map((r) => (
          <Link className="animal" key={r.id} href={`/registry/${r.id}`}>
            <span className="role">
              {alert.evidence?.role
                ? `Declared ${alert.evidence.role}`
                : "Related"}
            </span>
            <span className="reg">{r.registrationId}</span>
            <span className="nm">{r.name}</span>
          </Link>
        ))}
      </Animals>
    </Card>
  );
}

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--fg-subtle);
  margin-bottom: 12px;
`;

const Animals = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .animal {
    display: grid;
    grid-template-columns: 110px 130px 1fr;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
  }
  .animal:hover {
    background: var(--surface-2);
  }
  .animal.none {
    background: var(--surface-2);
    color: var(--fg-subtle);
  }
  .role {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    text-transform: capitalize;
  }
  .reg {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .nm {
    font-size: var(--text-sm);
  }
`;
