"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Avatar } from "@/imports/core/components/Avatar.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { COAT, STATUS_TONE, ageYears, hijriYear } from "./profileHelpers.js";

export function ProfileHeader({ animal, flags, can }) {
  const parentVerified = animal.parentageStatus === "verified";
  return (
    <Head>
      <div className="ident">
        <Avatar name={animal.name} size="lg" ring />
        <div>
          <Overline>
            {animal.breed} · {animal.lineageType}
          </Overline>
          <h1>
            {animal.name} <span className="ar">{animal.nameArabic}</span>
          </h1>
          <div className="meta">
            <span className="sub">{animal.registrationId}</span>
            <span className="dot">·</span>
            <span className="sub">chip {animal.microchipId}</span>
            <span className="dot">·</span>
            <span className="swatch">
              <Swatch $color={COAT[animal.coatColor] || "#999"} />
              {animal.coatColor}
            </span>
            <span className="dot">·</span>
            <span className="sub">
              DOB {animal.dateOfBirth} · {hijriYear(animal.birthYear)} AH ·{" "}
              {ageYears(animal.birthYear)} yrs
            </span>
            <span className="dot">·</span>
            <span className="sub">{animal.ownerName}</span>
          </div>
          <div className="chips">
            <Chip size="sm" tone={animal.hasDNA ? "accent" : "default"}>
              {animal.hasDNA ? "DNA on file" : "No DNA"}
            </Chip>
            <CapChip
              size="sm"
              tone={
                parentVerified
                  ? "success"
                  : animal.parentageStatus === "conflict"
                    ? "danger"
                    : "default"
              }
            >
              Parentage {animal.parentageStatus}
            </CapChip>
            {flags.length > 0 && (
              <Chip size="sm" tone="danger">
                {flags.length} integrity {flags.length === 1 ? "flag" : "flags"}
              </Chip>
            )}
            <CapChip size="sm" tone={STATUS_TONE[animal.status]}>
              {animal.status}
            </CapChip>
          </div>
        </div>
      </div>

      <div className="primary-actions">
        {can("runAnalysis") && (
          <Button
            as={Link}
            href={
              animal.registeredParentSireId
                ? `/verify?offspring=${animal.id}&sire=${animal.registeredParentSireId}`
                : `/verify?offspring=${animal.id}`
            }
            variant="primary"
            size="sm"
            leadingIcon={<Icon name="git-fork" size={14} />}
          >
            Run Verification
          </Button>
        )}
        {can("issueCertificate") && (
          <Button
            as={Link}
            href={`/reports?subject=${animal.id}`}
            variant="secondary"
            size="sm"
            leadingIcon={<Icon name="certificate" size={14} />}
          >
            Certificate
          </Button>
        )}
        {can("runAnalysis") && (
          <Button
            as={Link}
            href={`/verify/relationship?focal=${animal.id}`}
            variant="secondary"
            size="sm"
            leadingIcon={<Icon name="graph" size={14} />}
          >
            Find Relatives
          </Button>
        )}
        <Button
          as={Link}
          href={`/integrity?subject=${animal.id}`}
          variant="ghost"
          size="sm"
          leadingIcon={<Icon name="flag" size={14} />}
        >
          Flag
        </Button>
        {can("editRecords") && (
          <Button
            as={Link}
            href={`/registry/${animal.id}/edit`}
            variant="ghost"
            size="sm"
            leadingIcon={<Icon name="pencil-simple" size={14} />}
          >
            Edit
          </Button>
        )}
      </div>
    </Head>
  );
}

const CapChip = styled(Chip)`
  text-transform: capitalize;
`;

const Swatch = styled.i`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid var(--border);
  background: ${(p) => p.$color};
`;

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 16px;

  .ident {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  h1 {
    font-size: var(--text-2xl);
    line-height: 36px;
    font-weight: var(--weight-medium);
    letter-spacing: -0.02em;
  }
  h1 .ar {
    font-family: var(--font-sans);
    color: var(--fg-subtle);
    font-weight: var(--weight-regular);
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 6px;
  }
  .meta .sub {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .meta .dot {
    color: var(--fg-muted);
  }
  .meta .swatch {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  .chips {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }
  .primary-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;
