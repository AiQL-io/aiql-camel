"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { CompareStrip } from "@/imports/core/components/CompareStrip.jsx";
import { genotypeCsv } from "./profileHelpers.js";

export function DnaTab({
  access,
  animal,
  profile,
  compareId,
  setCompareId,
  can,
}) {
  const compareAnimal = compareId ? access.getAnimal(compareId) : null;
  const compareProfile = compareId ? access.getProfile(compareId) : null;

  return (
    <Card>
      <DnaHead>
        <Overline>
          STR profile · {profile.panelId} · {profile.genotypes.length} loci
        </Overline>
        <div className="dna-tools">
          <Select
            size="sm"
            value={compareId}
            placeholder="Compare against…"
            onChange={setCompareId}
            options={[
              { value: "", label: "Compare against…" },
              ...access.animals
                .filter((a) => a.id !== animal.id && a.dnaProfileId)
                .slice(0, 30)
                .map((a) => ({
                  value: a.id,
                  label: `${a.name} · ${a.registrationId}`,
                })),
            ]}
          />
          {can("exportGenotype") && (
            <button
              type="button"
              className="exp"
              onClick={() => genotypeCsv(animal, profile)}
            >
              <Icon name="download-simple" size={14} /> Export genotype
            </button>
          )}
        </div>
      </DnaHead>
      <DnaMeta>
        Analyzed {profile.analysisDate} · {profile.method} · QC{" "}
        {profile.qcStatus} · quality {Math.round(profile.qualityScore * 100)}% ·
        completeness {Math.round(profile.completeness * 100)}%
      </DnaMeta>

      {compareAnimal ? (
        <CompareSection>
          <CompareStrip
            rows={[
              {
                label: animal.name,
                sub: animal.registrationId,
                geno: profile.genotypes,
              },
              {
                label: compareAnimal.name,
                sub: compareAnimal.registrationId,
                geno: compareProfile.genotypes,
              },
            ]}
          />
        </CompareSection>
      ) : (
        <DnaGrid>
          {profile.genotypes.map((g) => (
            <div
              className="locus"
              key={g.locus}
              title={`${g.locus}: ${g.alleleA} / ${g.alleleB}${
                g.alleleA === g.alleleB ? " (homozygous)" : ""
              }`}
            >
              <div className="name">{g.locus}</div>
              <div className="alleles">
                {g.alleleA} / {g.alleleB}
              </div>
            </div>
          ))}
        </DnaGrid>
      )}
    </Card>
  );
}

const CompareSection = styled.div`
  margin-top: 16px;
`;

const DnaHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;

  .dna-tools {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .dna-tools .exp {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
    white-space: nowrap;
  }
`;

const DnaMeta = styled.div`
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--fg-subtle);
  margin-top: 10px;
`;

const DnaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 16px;

  .locus {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 10px 12px;
  }
  .locus .name {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .locus .alleles {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
    margin-top: 4px;
  }
`;
