"use client";

import React, { useMemo, useState, useRef } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { exportCsv } from "@/imports/verify/ui/components/exporters.js";
import { useGeneticsState } from "@/imports/genetics/state/scopeStore.js";
import { MetricTile } from "./MetricTile.jsx";
import { ExportMenu } from "./ExportMenu.jsx";
import { SaveCohort } from "./SaveCohort.jsx";
import { Heatmap } from "./relatedness/Heatmap.jsx";
import { BrushHistogram } from "./relatedness/BrushHistogram.jsx";
import * as pg from "@/imports/genetics/engine/popgen.js";

const ESTIMATORS = [
  { value: "qg", label: "Queller & Goodnight" },
  { value: "lr", label: "Lynch & Ritland" },
  { value: "wang", label: "Wang" },
];
const ORDERS = [
  { value: "cluster", label: "Hierarchical cluster" },
  { value: "line", label: "Declared line" },
  { value: "region", label: "Region" },
  { value: "id", label: "Registration ID" },
];

function summarizeBlock(members) {
  const counts = {};
  for (const m of members) counts[m.breed] = (counts[m.breed] || 0) + 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([breed, n]) => `${breed} ${n}`)
    .join(" · ");
}

export function RelatednessMatrixView({ access }) {
  const { resolve, audience } = useGeneticsState();
  const exec = audience === "executive";
  const r = resolve(access);

  const [estimator, setEstimator] = useState("qg");
  const [order, setOrder] = useState("cluster");
  const [threshold, setThreshold] = useState(0.25);
  const [selected, setSelected] = useState(null);
  const [band, setBand] = useState(null);
  const [block, setBlock] = useState(null);
  const [computing, setComputing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const heatRef = useRef(null);

  const flashCompute = () => {
    setComputing(true);
    setTimeout(() => setComputing(false), 420);
  };

  const model = useMemo(
    () => pg.relatednessMatrix(access, r.animals, { estimator, order }),
    [access, r.animals, estimator, order],
  );

  const blockMembers = useMemo(
    () => (block ? block.map((i) => model.labels[i]).filter(Boolean) : []),
    [block, model],
  );

  const pair = useMemo(
    () =>
      selected && model.labels[selected.i] && model.labels[selected.j]
        ? {
            a: model.labels[selected.i],
            b: model.labels[selected.j],
            r: model.matrix[selected.i][selected.j],
          }
        : null,
    [selected, model],
  );

  const sharing = useMemo(
    () => (pair ? pg.pairLocusSharing(access, pair.a.id, pair.b.id) : []),
    [access, pair],
  );

  const estLabel = ESTIMATORS.find((e) => e.value === estimator).label;

  const exportPairs = () => {
    const rows = [];
    for (let i = 0; i < model.n; i++) {
      for (let j = i + 1; j < model.n; j++) {
        const v = model.matrix[i][j];
        if (v >= threshold)
          rows.push({
            a: model.labels[i].reg,
            b: model.labels[j].reg,
            r: v,
            rel: pg.inferRel(v),
          });
      }
    }
    exportCsv({
      filename: `manhal_relatedness_pairs_r${threshold}.csv`,
      columns: [
        { label: "animal_A", get: (x) => x.a },
        { label: "animal_B", get: (x) => x.b },
        { label: "relatedness_r", get: (x) => x.r },
        { label: "inferred", get: (x) => x.rel },
      ],
      rows,
      provenance: {
        title: `Relatedness pairs ≥ ${threshold} — ${r.label}`,
        subjects: `${model.n} animals (sampled from ${model.poolSize})`,
        panel: access.panel,
        estimator: estLabel,
      },
    });
  };

  const exportMatrix = () => {
    const columns = [
      { label: "animal", get: (row) => row.reg },
      ...model.labels.map((lab, j) => ({
        label: lab.reg,
        get: (row) => model.matrix[row.i][j],
      })),
    ];
    exportCsv({
      filename: `manhal_relatedness_matrix_${estimator}.csv`,
      columns,
      rows: model.labels.map((lab, i) => ({ reg: lab.reg, i })),
      provenance: {
        title: `Relatedness matrix (${model.n}×${model.n}) — ${r.label}`,
        subjects: `${model.n} animals (sampled from ${model.poolSize})`,
        panel: access.panel,
        estimator: estLabel,
      },
    });
  };

  return (
    <>
      <Toolbar>
        <div className="grp">
          <span className="lab">Estimator</span>
          <Select
            size="sm"
            value={estimator}
            onChange={(v) => {
              setEstimator(v);
              flashCompute();
            }}
            options={ESTIMATORS}
          />
          <span className="lab">Order</span>
          <Select
            size="sm"
            value={order}
            onChange={(v) => {
              setOrder(v);
              flashCompute();
            }}
            options={ORDERS}
          />
          <span className="lab">Threshold r ≥ {threshold.toFixed(2)}</span>
          <input
            type="range"
            min="0"
            max="0.6"
            step="0.05"
            value={threshold}
            onChange={(e) => {
              setThreshold(Number(e.target.value));
              flashCompute();
            }}
          />
        </div>
        <ExportMenu
          figureRef={heatRef}
          figureName="manhal_relatedness_heatmap"
          items={[
            {
              label: `Pairwise list (r ≥ ${threshold.toFixed(2)}) CSV`,
              icon: "table",
              onClick: exportPairs,
            },
            {
              label: "Full matrix (CSV)",
              icon: "table",
              onClick: exportMatrix,
            },
          ]}
        />
      </Toolbar>

      {model.sampled && (
        <Note>
          <Icon name="info" size={13} /> N = {model.n} sampled from{" "}
          {model.poolSize.toLocaleString()} (live-render cap). Sampling is
          stratified by owner-family and reproducible.
        </Note>
      )}

      {exec && !showDetail && (
        <ExecBar>
          <span>Executive view — simplified.</span>
          <button type="button" onClick={() => setShowDetail(true)}>
            Show analyst detail
          </button>
        </ExecBar>
      )}

      <Grid>
        {!(exec && !showDetail) && (
          <Card>
            <PanelHead>
              <Overline>
                Relatedness heatmap ·{" "}
                {ESTIMATORS.find((e) => e.value === estimator).label}
              </Overline>
            </PanelHead>
            <div ref={heatRef} style={{ position: "relative" }}>
              {computing && (
                <Computing>
                  <span className="spin" />
                  Computing…
                </Computing>
              )}
              <Heatmap
                labels={model.labels}
                matrix={model.matrix}
                dendro={order === "cluster" ? model.dendro : null}
                threshold={threshold}
                selected={selected}
                onSelect={setSelected}
                lociN={model.lociN}
                band={band}
                onSelectBlock={(idx) => setBlock(idx)}
              />
            </div>
            {block && (
              <BlockBar>
                <div className="info">
                  <b>{blockMembers.length}</b> animals in selected block
                  <span className="lines">{summarizeBlock(blockMembers)}</span>
                </div>
                <div className="acts">
                  <SaveCohort
                    ids={blockMembers.map((m) => m.id)}
                    origin="Relatedness block"
                    defaultName="Related block"
                  />
                  <button type="button" onClick={() => setBlock(null)}>
                    Clear
                  </button>
                </div>
              </BlockBar>
            )}
          </Card>
        )}

        <div className="side">
          <MetricTile
            label="Mean kinship"
            value={model.meanKinship}
            methodKey="kinship"
          />
          <Card>
            <PanelHead>
              <Overline>r distribution</Overline>
              {band && (
                <button
                  type="button"
                  className="clrband"
                  onClick={() => setBand(null)}
                >
                  Clear filter
                </button>
              )}
            </PanelHead>
            <BrushHistogram
              bins={model.bins}
              rmax={0.6}
              band={band}
              onBand={setBand}
              height={110}
            />
            <Axis>
              <span>0</span>
              <span>0.6</span>
            </Axis>
            <p className="brushhint">
              {band
                ? `Showing pairs with r in ${band[0].toFixed(2)}–${band[1].toFixed(2)}.`
                : "Click a bar to filter the heatmap to that relatedness band."}
            </p>
          </Card>
          <Card>
            <PanelHead>
              <Overline>Selected pair</Overline>
            </PanelHead>
            {pair ? (
              <PairCard>
                <div className="ab">
                  <Link href={`/registry/${pair.a.id}`}>{pair.a.reg}</Link>
                  <Icon name="arrows-left-right" size={13} />
                  <Link href={`/registry/${pair.b.id}`}>{pair.b.reg}</Link>
                </div>
                <div className="metrics">
                  <span>
                    r <b>{pair.r.toFixed(3)}</b>
                  </span>
                  <span>
                    Inferred <b>{pg.inferRel(pair.r)}</b>
                  </span>
                  <span>
                    Loci <b>{model.lociN}</b>
                  </span>
                </div>
                <div className="strip">
                  <span className="striplab">Per-locus allele sharing</span>
                  <div className="cells">
                    {sharing.map((s) => (
                      <i
                        key={s.locus}
                        className={`c s${s.shared == null ? "x" : s.shared}`}
                        title={`${s.locus}: ${
                          s.shared == null
                            ? "no call"
                            : `${s.shared} shared allele${s.shared === 1 ? "" : "s"}`
                        }`}
                      />
                    ))}
                  </div>
                  <div className="legend">
                    <span>
                      <i className="c s2" /> 2 shared
                    </span>
                    <span>
                      <i className="c s1" /> 1
                    </span>
                    <span>
                      <i className="c s0" /> 0
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  as={Link}
                  href={`/verify/relationship?a=${pair.a.id}&b=${pair.b.id}`}
                  leadingIcon={<Icon name="graph" size={14} />}
                  style={{ marginTop: 10 }}
                >
                  Open in Relationship Explorer
                </Button>
              </PairCard>
            ) : (
              <p className="empty">Click a heatmap cell to inspect a pair.</p>
            )}
          </Card>
        </div>
      </Grid>
    </>
  );
}

const BlockBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid var(--accent);
  background: var(--accent-soft);
  border-radius: var(--radius-lg);

  .info {
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  .info b {
    color: var(--accent);
    margin-inline-end: 4px;
  }
  .lines {
    display: block;
    margin-top: 2px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-family: var(--font-mono);
  }
  .acts {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .acts > button {
    border: none;
    background: transparent;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    cursor: pointer;
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;

  .grp {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .lab {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  input[type="range"] {
    accent-color: var(--accent);
  }
`;

const Note = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  font-size: var(--text-xs);
  color: var(--fg-subtle);
`;

const ExecBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
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
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: color-mix(in srgb, var(--surface) 70%, transparent);
  font-size: var(--text-sm);
  color: var(--fg-subtle);
  z-index: 3;

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 16px;

  .side {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }
  .empty {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .clrband {
    border: none;
    background: transparent;
    color: var(--accent);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .brushhint {
    margin-top: 8px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;

const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const Axis = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--fg-subtle);
`;

const PairCard = styled.div`
  .ab {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }
  .ab a {
    color: var(--accent);
  }
  .metrics {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 10px;
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  .metrics b {
    color: var(--fg);
    margin-inline-start: 4px;
  }
  .strip {
    margin-top: 12px;
  }
  .striplab {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .cells {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    margin-top: 6px;
  }
  .c {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    display: inline-block;
  }
  .s2 {
    background: var(--danger);
  }
  .s1 {
    background: color-mix(in srgb, var(--danger) 45%, var(--surface));
  }
  .s0 {
    background: var(--surface-2);
    border: 1px solid var(--border);
  }
  .sx {
    background: repeating-linear-gradient(
      45deg,
      var(--surface-2),
      var(--surface-2) 2px,
      var(--separator) 2px,
      var(--separator) 4px
    );
  }
  .legend {
    display: flex;
    gap: 12px;
    margin-top: 8px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
`;
