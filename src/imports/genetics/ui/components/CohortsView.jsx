"use client";

import React, { useMemo, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { exportCsv } from "@/imports/verify/ui/components/exporters.js";
import {
  useGeneticsState,
  animalsForCohort,
} from "@/imports/genetics/state/scopeStore.js";
import * as pg from "@/imports/genetics/engine/popgen.js";
import { InsightCard } from "./InsightCard.jsx";
import { ExportMenu } from "./ExportMenu.jsx";
import { CohortManager } from "./cohorts/CohortManager.jsx";
import { CohortBuilder } from "./cohorts/CohortBuilder.jsx";
import { MetricComparison } from "./cohorts/MetricComparison.jsx";
import { FstMatrix } from "./cohorts/FstMatrix.jsx";
import { PerLocusCompare } from "./cohorts/PerLocusCompare.jsx";
import {
  buildComparisonExport,
  buildFstExport,
} from "./cohorts/cohortsHelpers.js";

export function CohortsView({ access }) {
  const {
    cohorts,
    saveCohort,
    updateCohort,
    duplicateCohort,
    deleteCohort,
    setScopeCohort,
    audience,
  } = useGeneticsState();
  const exec = audience === "executive";

  const [compareIds, setCompareIds] = useState([]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showPerLocus, setShowPerLocus] = useState(false);
  const [computing, setComputing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const compareRef = useRef(null);

  const flashCompute = () => {
    setComputing(true);
    setTimeout(() => setComputing(false), 420);
  };

  const breeds = access.facets.breeds;
  const resolveAnimals = useCallback(
    (c) => animalsForCohort(access, c),
    [access],
  );

  const validCompare = compareIds.filter((id) =>
    cohorts.some((c) => c.id === id),
  );

  const selectedCohorts = useMemo(
    () =>
      validCompare
        .map((id) => cohorts.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => ({ id: c.id, name: c.name, animals: resolveAnimals(c) })),
    [validCompare, cohorts, resolveAnimals],
  );

  const comparison = useMemo(
    () =>
      selectedCohorts.length >= 1
        ? pg.cohortComparison(access, selectedCohorts)
        : null,
    [access, selectedCohorts],
  );

  const toggleCompare = (id) => {
    flashCompute();
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const onCreate = ({ name, filters }) => {
    const id = saveCohort(name, filters);
    setCompareIds((p) => (p.length >= 4 ? p : [...p, id]));
  };

  const onSaveEdit = (id, patch) => {
    updateCohort(id, patch);
    flashCompute();
  };

  const quickAddLines = () => {
    for (const b of breeds) saveCohort(b, { breed: b });
  };

  const exportReport = () => {
    if (!comparison) return;
    const lines = [];
    lines.push(["metric", ...comparison.metrics.map((m) => m.name)]);
    const rowFor = (label, key, d) =>
      lines.push([label, ...comparison.metrics.map((m) => m[key].toFixed(d))]);
    rowFor("He", "he", 3);
    rowFor("Ho", "ho", 3);
    rowFor("Ar (rarefied)", "ar", 2);
    rowFor("Na", "na", 1);
    rowFor("Mean F", "meanF", 3);
    rowFor("Mean kinship", "meanKinship", 4);
    rowFor("Ne", "ne", 0);
    lines.push([]);
    lines.push(["F_ST", ...comparison.metrics.map((m) => m.name)]);
    comparison.metrics.forEach((m, i) => {
      lines.push([
        m.name,
        ...comparison.metrics.map((_, j) =>
          comparison.fstMatrix[i][j].band === "self"
            ? "—"
            : comparison.fstMatrix[i][j].value.toFixed(3),
        ),
      ]);
    });
    lines.push([]);
    if (comparison.verdict) lines.push(["Verdict", comparison.verdict.title]);
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const text = [
      "# Manhal — Cohort comparison report",
      `# Generated: ${new Date().toISOString()}`,
      ...lines.map((row) => row.map(esc).join(",")),
    ].join("\n");
    const blob = new Blob([text], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "manhal_cohort_comparison_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const canCompare = comparison && comparison.metrics.length >= 2;

  return (
    <>
      <Card>
        <Head>
          <Overline>Saved cohorts</Overline>
          <div className="actions">
            {cohorts.length < 2 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={quickAddLines}
                leadingIcon={<Icon name="lightning" size={14} />}
              >
                Quick-add line cohorts
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setBuilderOpen((o) => !o)}
              leadingIcon={<Icon name="plus" size={14} />}
            >
              New cohort
            </Button>
            {comparison && (
              <ExportMenu
                figureRef={compareRef}
                figureName="manhal_cohort_comparison"
                items={[
                  {
                    label: "Comparison table (CSV)",
                    icon: "table",
                    onClick: () =>
                      exportCsv(
                        buildComparisonExport({
                          metrics: comparison.metrics,
                          label: `${comparison.metrics.length} cohorts`,
                        }),
                      ),
                  },
                  {
                    label: "F_ST matrix (CSV)",
                    icon: "table",
                    onClick: () =>
                      exportCsv(
                        buildFstExport({
                          metrics: comparison.metrics,
                          fstMatrix: comparison.fstMatrix,
                        }),
                      ),
                  },
                  ...(canCompare
                    ? [
                        {
                          label: "Add comparison to report",
                          icon: "file-text",
                          onClick: exportReport,
                        },
                      ]
                    : []),
                ]}
              />
            )}
          </div>
        </Head>

        {(builderOpen || editing) && (
          <div style={{ marginBottom: 14 }}>
            <CohortBuilder
              access={access}
              edit={editing}
              onCreate={onCreate}
              onSave={onSaveEdit}
              onClose={() => {
                setBuilderOpen(false);
                setEditing(null);
              }}
            />
          </div>
        )}

        <CohortManager
          cohorts={cohorts}
          access={access}
          breeds={breeds}
          selectedIds={validCompare}
          onToggleCompare={toggleCompare}
          onSetScope={setScopeCohort}
          onEdit={(c) => {
            setBuilderOpen(false);
            setEditing(c);
          }}
          onDuplicate={(id) => duplicateCohort(id)}
          onDelete={(id) => {
            deleteCohort(id);
            setCompareIds((p) => p.filter((x) => x !== id));
          }}
          resolveAnimals={resolveAnimals}
        />
        {cohorts.length > 0 && (
          <p
            style={{
              marginTop: 12,
              fontSize: "var(--text-xs)",
              color: "var(--fg-subtle)",
            }}
          >
            Tick 2–4 cohorts to compare. {validCompare.length} selected.
          </p>
        )}
      </Card>

      {comparison && (
        <div ref={compareRef}>
          {!canCompare ? (
            <Card style={{ marginTop: 16 }}>
              <Overline>Single cohort — {selectedCohorts[0].name}</Overline>
              <Standalone>
                {comparison.metrics[0] && (
                  <>
                    <Stat label="N" v={comparison.metrics[0].n} />
                    <Stat label="He" v={comparison.metrics[0].he} />
                    <Stat label="Ho" v={comparison.metrics[0].ho} />
                    <Stat label="Ar" v={comparison.metrics[0].ar} />
                    <Stat label="Na" v={comparison.metrics[0].na} />
                    <Stat label="Mean F" v={comparison.metrics[0].meanF} />
                    <Stat
                      label="Kinship"
                      v={comparison.metrics[0].meanKinship}
                    />
                    <Stat label="Ne" v={comparison.metrics[0].ne} />
                  </>
                )}
              </Standalone>
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "var(--text-xs)",
                  color: "var(--fg-subtle)",
                }}
              >
                <Icon name="info" size={13} /> Add a second cohort to compute
                differentiation (F_ST) and a comparison verdict.
              </p>
            </Card>
          ) : (
            <>
              {comparison.verdict && (
                <div style={{ marginTop: 16 }}>
                  <InsightCard insight={comparison.verdict} />
                </div>
              )}
              {exec && !showDetail ? (
                <>
                  <Card style={{ marginTop: 16 }}>
                    <Overline>Metric comparison</Overline>
                    <p className="sub">
                      Each value with a 95% interval (bootstrap over loci).
                      Allelic richness is rarefied to the smallest cohort.
                    </p>
                    <MetricComparison metrics={comparison.metrics} />
                  </Card>
                  <ExecBar>
                    <span>Executive view — simplified.</span>
                    <button type="button" onClick={() => setShowDetail(true)}>
                      Show analyst detail
                    </button>
                  </ExecBar>
                </>
              ) : (
                <>
                  <Grid>
                    <Card>
                      <Overline>Metric comparison</Overline>
                      <p className="sub">
                        Each value with a 95% interval (bootstrap over loci).
                        Allelic richness is rarefied to the smallest cohort.
                      </p>
                      <MetricComparison metrics={comparison.metrics} />
                    </Card>
                    <Card>
                      <Overline>Differentiation · pairwise F_ST</Overline>
                      <p className="sub">
                        Wright&apos;s F_ST with interpretation band.
                      </p>
                      {computing ? (
                        <Computing>
                          <span className="spin" />
                          Resampling F_ST + confidence intervals…
                        </Computing>
                      ) : (
                        <FstMatrix
                          metrics={comparison.metrics}
                          fstMatrix={comparison.fstMatrix}
                        />
                      )}
                    </Card>
                  </Grid>
                  <Card style={{ marginTop: 16 }}>
                    <Head>
                      <Overline>Per-locus comparison</Overline>
                      <button
                        type="button"
                        className="toggle"
                        onClick={() => setShowPerLocus((s) => !s)}
                      >
                        {showPerLocus ? "Hide" : "Show drivers"}
                      </button>
                    </Head>
                    {showPerLocus && (
                      <PerLocusCompare
                        drivers={comparison.drivers}
                        nameA={comparison.metrics[0].name}
                        nameB={comparison.metrics[1].name}
                      />
                    )}
                  </Card>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

function Stat({ label, v }) {
  return (
    <div className="stat">
      <span className="l">{label}</span>
      <b>{v}</b>
    </div>
  );
}

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .toggle {
    border: none;
    background: transparent;
    color: var(--accent);
    font-size: var(--text-xs);
    cursor: pointer;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 16px;
  margin-top: 16px;

  .sub {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin: 4px 0 14px;
  }
`;

const ExecBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--fg-subtle);

  button {
    border: none;
    background: transparent;
    color: var(--accent);
    font-size: var(--text-sm);
    cursor: pointer;
    padding: 0;
  }
`;

const Computing = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 40px 12px;
  justify-content: center;
  font-size: var(--text-sm);
  color: var(--fg-subtle);

  .spin {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Standalone = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 12px;
  margin: 14px 0;

  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }
  .stat .l {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .stat b {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
  }
`;
