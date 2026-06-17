"use client";

import React, { useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { CompareStrip } from "@/imports/core/components/CompareStrip.jsx";
import { EgoNetwork } from "@/imports/core/components/EgoNetwork.jsx";
import { useRouter } from "next/navigation";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { useRelationship } from "@/imports/verify/hooks/useRelationship.js";
import { useCases } from "@/imports/verify/state/caseStore.js";
import { SubjectPicker } from "./SubjectPicker.jsx";
import { MethodsDrawer } from "./MethodsDrawer.jsx";
import { exportCsv } from "./exporters.js";

function declaredRelationship(access, fId, oId) {
  const f = access.getAnimal(fId);
  const o = access.getAnimal(oId);
  if (!f || !o) return "—";
  if (f.registeredParentSireId === o.id || f.registeredParentDamId === o.id)
    return "Declared parent";
  if (o.registeredParentSireId === f.id || o.registeredParentDamId === f.id)
    return "Declared offspring";
  const shareSire =
    f.registeredParentSireId &&
    f.registeredParentSireId === o.registeredParentSireId;
  const shareDam =
    f.registeredParentDamId &&
    f.registeredParentDamId === o.registeredParentDamId;
  if (shareSire && shareDam) return "Declared full sib";
  if (shareSire || shareDam) return "Declared half sib";
  return "Not recorded";
}

function agrees(inferred, declared) {
  const po = inferred === "Parent–offspring";
  const fs = inferred === "Full siblings";
  const hs = inferred === "Half siblings";
  if (po)
    return declared === "Declared parent" || declared === "Declared offspring";
  if (fs) return declared === "Declared full sib";
  if (hs) return declared === "Declared half sib";
  return true; // unrelated/cousin — not flagged
}

export function RelationshipView({ access }) {
  const rl = useRelationship(access);
  const { can } = useRole();
  const { createCase, setActiveCase } = useCases();
  const router = useRouter();
  const [methods, setMethods] = useState(false);
  const estLabel = rl.estimators.find((e) => e.value === rl.estimator)?.label;
  const pair = rl.pair;
  const poConsistent = pair && pair.ibs && pair.ibs.share0 === 0;

  const finalizePO = () => {
    if (!rl.aId || !rl.bId) return;
    const res = access.verify(rl.bId, rl.aId, {}); // B offspring, A sire
    const snap = (a, geno) =>
      a
        ? {
            id: a.id,
            name: a.name,
            reg: a.registrationId,
            sex: a.sex,
            genotypes: geno ? geno.map((g) => ({ ...g })) : [],
          }
        : null;
    const c = createCase({
      type: "paternity",
      subjects: {
        offspring: snap(rl.b, rl.bProf?.genotypes),
        sire: snap(rl.a, rl.aProf?.genotypes),
      },
      verdict: res?.verdict || "consistent",
      stats: {
        lociCompared: res?.lociCompared,
        mismatchCount: res?.mismatchCount,
        cpe: res?.cpe,
        parentageIndex: res?.parentageIndex,
      },
      evidence: { mismatchLoci: res?.mismatchLoci || [] },
    });
    setActiveCase(c.id);
    router.push("/verify/cases");
  };

  const exportRelatives = () =>
    exportCsv({
      filename: `relatives-${rl.a?.registrationId || "focal"}.csv`,
      columns: [
        { label: "relative", get: (r) => r.animal.registrationId },
        { label: "name", get: (r) => r.animal.name },
        { label: "relatedness_r", get: (r) => r.r },
        { label: "inferred", get: (r) => r.inferred },
        { label: "loci", get: (r) => r.loci },
        {
          label: "declared",
          get: (r) => declaredRelationship(access, rl.aId, r.animal.id),
        },
      ],
      rows: rl.family,
      provenance: {
        title: "Family reconstruction",
        subjects: `focal ${rl.a?.registrationId}`,
        panel: access.panel,
        estimator: estLabel,
      },
    });

  return (
    <>
      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Overline style={{ marginBottom: 12 }}>Pair analysis</Overline>
          <button
            type="button"
            onClick={() => setMethods(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 28,
              padding: "0 10px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-pill)",
              background: "transparent",
              color: "var(--fg-secondary)",
              fontSize: "var(--text-xs)",
              cursor: "pointer",
            }}
          >
            <Icon name="info" size={14} /> Methods
          </button>
        </div>
        <PairRow>
          <SubjectPicker
            access={access}
            value={rl.aId}
            onChange={rl.setAId}
            label="Animal A"
          />
          <SubjectPicker
            access={access}
            value={rl.bId}
            onChange={rl.setBId}
            label="Animal B"
          />
          <div className="est">
            <span className="lbl">Estimator</span>
            <Select
              block
              size="sm"
              value={rl.estimator}
              onChange={rl.setEstimator}
              options={rl.estimators}
            />
          </div>
        </PairRow>
      </Card>

      {pair && rl.a && rl.b && (
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
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  flexWrap: "wrap",
                }}
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
                  onClick={finalizePO}
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
      )}

      {rl.a && (
        <Card style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Overline style={{ marginBottom: 6 }}>
              Family reconstruction · {rl.a.name}
            </Overline>
            {rl.family.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={exportRelatives}
                leadingIcon={<Icon name="download-simple" size={13} />}
              >
                Export
              </Button>
            )}
          </div>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--fg-subtle)",
              marginBottom: 4,
            }}
          >
            Nearest genetic relatives inferred from DNA, compared against the
            registry-declared relationship.
          </p>
          <Recon>
            <div className="net">
              {rl.family.length ? (
                <EgoNetwork
                  focal={rl.a}
                  relatives={rl.family}
                  onSelect={(rel) => rl.setBId(rel.animal.id)}
                />
              ) : (
                <p className="empty">No close genetic relatives found.</p>
              )}
            </div>
            <div className="tbl">
              <div className="thead">
                <span>Relative</span>
                <span>r</span>
                <span>Inferred</span>
                <span>Declared</span>
                <span />
              </div>
              {rl.family.map((rel) => {
                const declared = declaredRelationship(
                  access,
                  rl.aId,
                  rel.animal.id,
                );
                const ok = agrees(rel.inferred, declared);
                const informative = rel.r >= 0.18;
                return (
                  <div className="trow" key={rel.animal.id}>
                    <Link href={`/registry/${rel.animal.id}`} className="rl-nm">
                      {rel.animal.name}
                      <i>{rel.animal.registrationId}</i>
                    </Link>
                    <span className="mono">{rel.r.toFixed(2)}</span>
                    <span className="mono">{rel.inferred}</span>
                    <span className="declared">{declared}</span>
                    <span>
                      {informative && !ok ? (
                        <Chip size="sm" tone="danger">
                          conflict
                        </Chip>
                      ) : informative ? (
                        <Chip size="sm" tone="success">
                          match
                        </Chip>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </Recon>
        </Card>
      )}

      {!rl.a && (
        <Card style={{ marginTop: 16 }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--fg-subtle)" }}>
            Pick Animal A to quantify any-pair relatedness and reconstruct its
            family from DNA.
          </p>
        </Card>
      )}
      <MethodsDrawer open={methods} onClose={() => setMethods(false)} />
    </>
  );
}

function Metric({ k, v }) {
  return (
    <div className="metric">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

const PairRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 220px;
  gap: 16px;
  align-items: end;

  .est .lbl {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fg-subtle);
    margin-bottom: 6px;
  }
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

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

const Recon = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  margin-top: 14px;
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }

  .empty {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .thead,
  .trow {
    display: grid;
    grid-template-columns: 1.6fr 50px 1.3fr 1.3fr 70px;
    gap: 8px;
    align-items: center;
    padding: 8px 6px;
  }
  .thead {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
    border-bottom: 1px solid var(--border);
  }
  .trow {
    border-bottom: 1px solid var(--separator);
    font-size: var(--text-sm);
  }
  .rl-nm {
    display: flex;
    flex-direction: column;
    font-weight: var(--weight-medium);
  }
  .rl-nm i {
    font-style: normal;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
  .declared {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .muted {
    color: var(--fg-muted);
  }
`;
