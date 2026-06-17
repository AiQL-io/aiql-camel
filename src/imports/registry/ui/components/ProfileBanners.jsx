"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function ProfileBanners({ animal }) {
  return (
    <>
      {(animal.status === "deceased" || animal.status === "exported") && (
        <Banner $tone="muted">
          <Icon name="info" size={16} />
          <span>
            This animal is marked <b>{animal.status}</b>. Records are read-only
            for reference.
          </span>
        </Banner>
      )}
      {!animal.hasDNA && (
        <Banner $tone="warning">
          <Icon name="dna" size={16} />
          <span>
            No DNA profile on file — this animal can&apos;t be tested.
          </span>
          <Link href={`/registry/${animal.id}/edit`}>
            Associate a profile <Icon name="arrow-right" size={12} />
          </Link>
        </Banner>
      )}
      {animal.hasDNA && animal.parentageStatus === "unknown" && (
        <Banner $tone="accent">
          <Icon name="git-fork" size={16} />
          <span>
            Profiled, but no parentage recorded. Let the platform propose the
            biological parents.
          </span>
          <Link href={`/verify/search?offspring=${animal.id}`}>
            Find candidate parents <Icon name="arrow-right" size={12} />
          </Link>
        </Banner>
      )}
    </>
  );
}

const Banner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 11px 16px;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  border: 1px solid
    ${(p) =>
      p.$tone === "warning"
        ? "var(--warning)"
        : p.$tone === "accent"
          ? "var(--accent)"
          : "var(--border)"};
  background: ${(p) =>
    p.$tone === "warning"
      ? "color-mix(in srgb, var(--warning) 8%, var(--surface))"
      : p.$tone === "accent"
        ? "var(--accent-soft)"
        : "var(--surface-2)"};
  color: ${(p) =>
    p.$tone === "warning"
      ? "var(--warning)"
      : p.$tone === "accent"
        ? "var(--accent)"
        : "var(--fg-secondary)"};

  span b {
    text-transform: capitalize;
  }
  a {
    margin-inline-start: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: var(--weight-medium);
    color: inherit;
    white-space: nowrap;
  }
`;
