"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function AlertSubjectBanner({ subjectAnimal }) {
  if (!subjectAnimal) return null;
  return (
    <Banner>
      <Icon name="funnel" size={14} />
      <span>
        Filtered to <b>{subjectAnimal.registrationId}</b> · {subjectAnimal.name}
      </span>
      <Link href="/integrity">Clear filter</Link>
    </Banner>
  );
}

const Banner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 10px 14px;
  border: 1px solid var(--accent);
  background: var(--accent-soft);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--fg-secondary);

  b {
    font-family: var(--font-mono);
    color: var(--fg);
  }
  a {
    margin-inline-start: auto;
    color: var(--accent);
    font-size: var(--text-xs);
  }
`;
