"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Drawer } from "@/imports/core/components/Drawer.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Avatar } from "@/imports/core/components/Avatar.jsx";

const PARENT_TONE = {
  verified: "success",
  conflict: "danger",
  unknown: "default",
};

function Fact({ k, v }) {
  return (
    <div className="fact">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

export function CamelDrawer({ animal, access, onClose }) {
  const open = Boolean(animal);
  return (
    <Drawer open={open} onClose={onClose} title="Animal preview">
      {animal && (
        <Body>
          <div className="top">
            <Avatar name={animal.name} size="lg" />
            <div>
              <div className="nm">
                {animal.name} <span className="ar">{animal.nameArabic}</span>
              </div>
              <div className="id">{animal.registrationId}</div>
              <div className="tags">
                <Chip
                  size="sm"
                  tone={PARENT_TONE[animal.parentageStatus]}
                  style={{ textTransform: "capitalize" }}
                >
                  {animal.parentageStatus}
                </Chip>
                {animal.hasDNA && (
                  <Chip size="sm" tone="accent">
                    DNA on file
                  </Chip>
                )}
                {animal.alertCount > 0 && (
                  <Chip
                    size="sm"
                    tone={animal.hasCriticalAlert ? "danger" : "warning"}
                  >
                    {animal.alertCount} alert
                    {animal.alertCount === 1 ? "" : "s"}
                  </Chip>
                )}
              </div>
            </div>
          </div>

          <Facts>
            <Fact
              k="Breed / line"
              v={`${animal.breed} · ${animal.lineageType}`}
            />
            <Fact k="Sex" v={animal.sex} />
            <Fact k="Born" v={animal.dateOfBirth} />
            <Fact k="Region" v={animal.region} />
            <Fact k="Owner" v={animal.ownerName} />
            <Fact k="Microchip" v={animal.microchipId} />
            <Fact
              k="Completeness"
              v={`${Math.round(animal.completenessScore * 100)}%`}
            />
            <Fact
              k="Inbreeding"
              v={`F ${animal.inbreedingF} · ${animal.inbreedingPercentile}th pct`}
            />
          </Facts>

          <Button
            as={Link}
            href={`/registry/${animal.id}`}
            variant="primary"
            style={{ width: "100%", marginTop: 18 }}
            leadingIcon={<Icon name="arrow-right" size={16} />}
          >
            Open full profile
          </Button>
          <div className="quick">
            <Link href={`/verify?offspring=${animal.id}`}>
              <Icon name="git-fork" size={14} /> Run verification
            </Link>
            <Link href={`/verify/relationship?focal=${animal.id}`}>
              <Icon name="graph" size={14} /> Find relatives
            </Link>
          </div>
        </Body>
      )}
    </Drawer>
  );
}

const Body = styled.div`
  .top {
    display: flex;
    gap: 14px;
    align-items: center;
  }
  .nm {
    font-size: var(--text-lg);
    font-weight: var(--weight-medium);
  }
  .nm .ar {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
    margin-inline-start: 4px;
  }
  .id {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 2px;
  }
  .tags {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    flex-wrap: wrap;
  }
  .quick {
    display: flex;
    gap: 10px;
    margin-top: 12px;
  }
  .quick a {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 34px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .quick a:hover {
    background: var(--surface-2);
  }
`;

const Facts = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--separator);

  .fact .k {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .fact .v {
    display: block;
    font-size: var(--text-sm);
    margin-top: 3px;
    text-transform: capitalize;
  }
`;
