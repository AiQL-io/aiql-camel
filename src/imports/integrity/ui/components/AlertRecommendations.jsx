"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { RECOMMENDED } from "./alertConstants.js";

export function AlertRecommendations({ alert, subject }) {
  const isParentage =
    alert.type === "impossible_parentage" ||
    alert.type === "registry_biology_conflict";

  return (
    <Card>
      <SectionTitle>
        <Icon name="lightbulb" size={15} /> Recommended actions
      </SectionTitle>
      <Recs>
        {(RECOMMENDED[alert.type] || ["Investigate and resolve."]).map(
          (r, i) => (
            <li key={i}>{r}</li>
          ),
        )}
      </Recs>
      {isParentage && subject && (
        <ReconcileSlot>
          <Button
            size="sm"
            variant="primary"
            as={Link}
            href={`/integrity/reconcile/${subject.id}`}
            leadingIcon={<Icon name="git-diff" size={14} />}
          >
            Open Reconciliation
          </Button>
        </ReconcileSlot>
      )}
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

const Recs = styled.ul`
  margin: 4px 0 0;
  padding-inline-start: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  li {
    font-size: var(--text-sm);
    color: var(--fg-secondary);
    line-height: var(--leading-normal);
  }
`;

const ReconcileSlot = styled.div`
  margin-top: 12px;
`;
