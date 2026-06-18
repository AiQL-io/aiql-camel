"use client";

import React, { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { Switch } from "@/imports/core/components/Switch.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import {
  exportCsv,
  download,
} from "@/imports/verify/ui/components/exporters.js";
import { useGeneticsState } from "@/imports/genetics/state/scopeStore.js";
import { InsightCard } from "./InsightCard.jsx";
import { ExportMenu } from "./ExportMenu.jsx";
import { SaveCohort } from "./SaveCohort.jsx";
import { StructureScatter } from "./structure/StructureScatter.jsx";
import { ScreePlot } from "./structure/ScreePlot.jsx";
import { AncestryBars } from "./structure/AncestryBars.jsx";
import { ConcordancePanel } from "./structure/ConcordancePanel.jsx";
import * as pg from "@/imports/genetics/engine/popgen.js";

const COLOR_BY = [
  { value: "declared", label: "Declared line" },
  { value: "genetic", label: "Genetic cluster" },
  { value: "region", label: "Region" },
  { value: "owner", label: "Owner" },
  { value: "f", label: "Inbreeding F (ramp)" },
];
const AXES = [
  { value: "12", label: "PC1 × PC2" },
  { value: "13", label: "PC1 × PC3" },
  { value: "23", label: "PC2 × PC3" },
];

export function StructureView({ access }) {
  const { resolve, audience } = useGeneticsState();
  const exec = audience === "executive";
  const router = useRouter();
  const r = resolve(access);

  const [engine, setEngine] = useState("pcoa");
  const [k, setK] = useState(4);
  const [colorBy, setColorBy] = useState("declared");
  const [axis, setAxis] = useState("12");
  const [threeD, setThreeD] = useState(false);
  const [rot, setRot] = useState(0.6);
  const [hulls, setHulls] = useState(false);
  const [selected, setSelected] = useState(null);
  const [computing, setComputing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const scatterRef = useRef(null);

  const flashCompute = () => {
    setComputing(true);
    setTimeout(() => setComputing(false), 420);
  };

  const model = useMemo(
    () => pg.structureModel(access, r.animals, { k, engine }),
    [access, r.animals, k, engine],
  );

  const insight = useMemo(() => {
    const pairs = new Map();
    for (const o of model.concordance.outliers) {
      const key = `${o.declaredBreed}→${o.geneticBreed}`;
      pairs.set(key, (pairs.get(key) || 0) + 1);
    }
    const top = [...pairs.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!top) return null;
    const [pair, count] = top;
    const [a, b] = pair.split("→");
    return {
      id: "concordance",
      severity: "high",
      title: `${count} animals declared as ${a} cluster genetically with ${b}`,
      detail: `Overall declared↔genetic concordance ${model.concordance.score}%. Only DNA reveals this.`,
      href: "#concordance",
      cta: "See outliers",
    };
  }, [model]);

  const selectedAnimals = useMemo(() => {
    if (!selected) return null;
    const set = new Set(selected);
    const pts = model.points.filter((p) => set.has(p.id));
    const byBreed = {};
    for (const p of pts)
      byBreed[p.declaredBreed] = (byBreed[p.declaredBreed] || 0) + 1;
    return { pts, byBreed };
  }, [selected, model]);

  const engineLabel =
    engine === "pca" ? "PCA (allele dosage)" : "PCoA (classical MDS)";

  const exportCoords = () => {
    exportCsv({
      filename: "manhal_structure_coordinates.csv",
      columns: [
        { label: "registration", get: (p) => p.reg },
        { label: "declared_line", get: (p) => p.declaredBreed },
        { label: "genetic_line", get: (p) => p.geneticBreed },
        { label: "PC1", get: (p) => p.x },
        { label: "PC2", get: (p) => p.y },
        { label: "PC3", get: (p) => p.z },
        { label: "F", get: (p) => p.f },
      ],
      rows: model.points,
      provenance: {
        title: `Population structure (${engineLabel}) — ${r.label}`,
        subjects: `${model.n} animals${model.sampled ? " (sampled)" : ""}`,
        panel: access.panel,
        estimator: engineLabel,
      },
    });
  };

  const exportStructure = () => {
    const head = [
      "# Manhal genotype export — STRUCTURE / GenAlEx compatible",
      `# Panel: ${access.panel.name || access.panel.id} (${model.points.length} individuals, ${access.panel.loci.length} loci)`,
      `# Scope: ${r.label} · ${new Date().toISOString()}`,
      ["IndividualID", "DeclaredLine", "GeneticK"]
        .concat(access.panel.loci.map((l) => l.locusName))
        .join("\t"),
    ];
    const body = model.points.map((p) => {
      const prof = access.getProfile(p.id);
      const byLocus = new Map(
        (prof ? prof.genotypes : []).map((g) => [g.locus, g]),
      );
      const cells = access.panel.loci.map((l) => {
        const g = byLocus.get(l.locusName);
        return g ? `${g.alleleA}/${g.alleleB}` : "0/0";
      });
      return [p.reg, p.declaredBreed, p.geneticK].concat(cells).join("\t");
    });
    download(
      [...head, ...body].join("\n"),
      "manhal_structure_genotypes.tsv",
      "text/tab-separated-values",
    );
  };

  return (
    <>
      <Toolbar>
        <div className="grp">
          <Select
            size="sm"
            value={engine}
            onChange={(v) => {
              setEngine(v);
              flashCompute();
            }}
            options={[
              { value: "pcoa", label: "PCoA" },
              { value: "pca", label: "PCA" },
            ]}
          />
          <Select size="sm" value={axis} onChange={setAxis} options={AXES} />
          <Select
            size="sm"
            value={String(k)}
            onChange={(v) => {
              setK(Number(v));
              flashCompute();
            }}
            options={[2, 3, 4, 5, 6].map((n) => ({
              value: String(n),
              label: `K = ${n}`,
            }))}
          />
          <label className="td">
            <Switch checked={threeD} onChange={setThreeD} /> 3-D
          </label>
          <label className="td">
            <Switch checked={hulls} onChange={setHulls} /> Hulls
          </label>
          {threeD && (
            <label className="rot">
              <Icon name="arrows-clockwise" size={13} />
              <input
                type="range"
                min="0"
                max={String(Math.PI * 2)}
                step="0.05"
                value={rot}
                onChange={(e) => setRot(Number(e.target.value))}
                aria-label="Rotate 3-D view"
              />
            </label>
          )}
        </div>
        <ExportMenu
          figureRef={scatterRef}
          figureName="manhal_structure"
          items={[
            {
              label: "Coordinates (CSV)",
              icon: "table",
              onClick: exportCoords,
            },
            {
              label: "Genotypes → STRUCTURE/GenAlEx",
              icon: "dna",
              onClick: exportStructure,
            },
          ]}
        />
      </Toolbar>

      {insight && (
        <div style={{ marginBottom: 16 }}>
          <InsightCard insight={insight} />
        </div>
      )}

      {model.sampled && (
        <Note>
          <Icon name="info" size={13} /> Showing a representative seeded sample
          of {model.n.toLocaleString()} of {r.n.toLocaleString()} animals
          (render cap). Sampling is stratified and reproducible.
        </Note>
      )}

      <Grid>
        <Card>
          <PanelHead>
            <Overline>
              Ordination scatter · color by{" "}
              {COLOR_BY.find((c) => c.value === colorBy).label}
            </Overline>
          </PanelHead>
          <div ref={scatterRef} style={{ position: "relative" }}>
            {computing && (
              <Computing>
                <span className="spin" />
                Computing…
              </Computing>
            )}
            <StructureScatter
              points={model.points}
              breeds={model.breeds}
              regions={access.facets.regions}
              colorBy={colorBy}
              axis={axis}
              threeD={threeD}
              rot={rot}
              hulls={hulls}
              onSelect={(ids) => setSelected(ids.length ? ids : null)}
              onPointClick={(id) => router.push(`/registry/${id}`)}
              selectedIds={selected ? new Set(selected) : null}
            />
          </div>
          {selectedAnimals && (
            <Selection>
              <div className="head">
                <b>{selectedAnimals.pts.length} selected</b>
                <button type="button" onClick={() => setSelected(null)}>
                  Clear
                </button>
              </div>
              <div className="comp">
                {Object.entries(selectedAnimals.byBreed)
                  .sort((a, b) => b[1] - a[1])
                  .map(([breed, n]) => (
                    <span key={breed}>
                      {breed} <b>{n}</b>
                    </span>
                  ))}
              </div>
              <div className="actions">
                <SaveCohort
                  ids={selectedAnimals.pts.map((p) => p.id)}
                  origin="Structure selection"
                  defaultName="Structure selection"
                />
              </div>
            </Selection>
          )}
        </Card>

        <div className="side">
          <Card>
            <PanelHead>
              <Overline>Scree · variance explained</Overline>
            </PanelHead>
            <ScreePlot scree={model.scree} />
          </Card>
          <Card>
            <PanelHead>
              <Overline>Color by</Overline>
            </PanelHead>
            <ColorBy>
              {COLOR_BY.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={colorBy === c.value ? "on" : ""}
                  onClick={() => setColorBy(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </ColorBy>
          </Card>
          {!(exec && !showDetail) && (
            <Card id="concordance">
              <PanelHead>
                <Overline>Concordance analysis</Overline>
              </PanelHead>
              <ConcordancePanel concordance={model.concordance} />
            </Card>
          )}
        </div>
      </Grid>

      {exec && !showDetail ? (
        <ExecBar>
          <span>Executive view — simplified.</span>
          <button type="button" onClick={() => setShowDetail(true)}>
            Show analyst detail
          </button>
        </ExecBar>
      ) : (
        <Card style={{ marginTop: 16 }}>
          <PanelHead>
            <Overline>
              Ancestry (admixture-style) · grouped by declared line
            </Overline>
          </PanelHead>
          <AncestryBars points={model.points} k={k} breeds={model.breeds} />
        </Card>
      )}
    </>
  );
}

const ColorBy = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  button {
    height: 30px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  button.on {
    border-color: var(--accent);
    background: var(--accent-soft);
    color: var(--accent);
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
  .td {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  .rot {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--fg-subtle);
  }
  .rot input[type="range"] {
    width: 90px;
    accent-color: var(--accent);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 16px;

  .side {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }
`;

const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
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

const Selection = styled.div`
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--accent);
  background: var(--accent-soft);
  border-radius: var(--radius-lg);

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .head b {
    font-size: var(--text-sm);
    color: var(--accent);
  }
  .head button {
    border: none;
    background: transparent;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .comp {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
  }
  .comp span {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .comp b {
    font-family: var(--font-mono);
    color: var(--fg);
  }
  .actions {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }
`;
