"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { CompareStrip } from "@/imports/core/components/CompareStrip.jsx";

function Metric({ k, v }) {
  return (
    <div className="metric">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

export function PairResult({
  rl,
  pair,
  estLabel,
  poConsistent,
  can,
  onFinalizePO,
}) {
  return (
    <>
      <Card style={{ marginTop: 16 }}>
        <Result>
          <div className="big">
            <span className="r">r = {pair.r.toFixed(2)}</span>
            <span className="sub">{estLabel}</span>
          </div>
          <div className="cat">
            <Chip
              tone={pair.r >= 0.37 ? "accent" : "default"}
              style={{ textTransform: "none" }}
            >
              {pair.inferred}
            </Chip>
            <span className="conf">{pair.confidence} confidence</span>
          </div>
          <Metrics>
            <Metric k="Kinship θ" v={pair.kinship.toFixed(3)} />
            <Metric k="Loci used" v={pair.loci} />
            <Metric
              k="IBS (0/1/2)"
              v={`${pair.ibs?.share0 ?? 0}/${pair.ibs?.share1 ?? 0}/${pair.ibs?.share2 ?? 0}`}
            />
          </Metrics>
        </Result>
        <div className="po-note">
          <Icon name="info" size={13} /> Zero-sharing loci:{" "}
          <b>{pair.ibs.share0}</b> —{" "}
          {poConsistent
            ? "consistent with parent–offspring (an allele shared at every locus)."
            : "rules out simple parent–offspring; full/half-sib more likely. A trio with a third animal would resolve it."}
        </div>
        {pair.inferred === "Parent–offspring" && can("runAnalysis") && (
          <div
            style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}
          >
            <Button
              as={Link}
              href={`/verify?offspring=${rl.bId}&sire=${rl.aId}&mode=paternity`}
              variant="secondary"
              size="sm"
              leadingIcon={<Icon name="git-fork" size={14} />}
            >
              Confirm in Workbench
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onFinalizePO}
              leadingIcon={<Icon name="folder-plus" size={14} />}
            >
              Finalize to case
            </Button>
          </div>
        )}
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Overline style={{ marginBottom: 12 }}>Per-locus sharing</Overline>
        <CompareStrip
          rows={[
            {
              label: rl.a.name,
              sub: rl.a.registrationId,
              geno: rl.aProf?.genotypes || [],
            },
            {
              label: rl.b.name,
              sub: rl.b.registrationId,
              geno: rl.bProf?.genotypes || [],
            },
          ]}
        />
      </Card>
    </>
  );
}

const Result = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;

  .big .r {
    font-size: var(--text-2xl);
    font-weight: var(--weight-medium);
  }
  .big .sub {
    display: block;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 2px;
  }
  .cat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .cat .conf {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;

const Metrics = styled.div`
  display: flex;
  gap: 24px;
  margin-inline-start: auto;

  .metric .k {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .metric .v {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
    margin-top: 3px;
  }
`;
