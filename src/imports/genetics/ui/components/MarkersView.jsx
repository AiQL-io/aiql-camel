"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { exportCsv } from "@/imports/verify/ui/components/exporters.js";
import { useGeneticsState } from "@/imports/genetics/state/scopeStore.js";
import * as pg from "@/imports/genetics/engine/popgen.js";
import { ExportMenu } from "./ExportMenu.jsx";
import { PanelPowerKpis } from "./markers/PanelPowerKpis.jsx";
import { PerLocusTable } from "./markers/PerLocusTable.jsx";
import { LocusDetail } from "./markers/LocusDetail.jsx";
import { InformativenessRanking } from "./markers/InformativenessRanking.jsx";
import {
  buildPerLocusExport,
  exportGenAlEx,
  exportGenepop,
} from "./markers/markersHelpers.js";

function initialLocus() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("locus") || "";
}

export function MarkersView({ access }) {
  const { resolve, audience } = useGeneticsState();
  const exec = audience === "executive";
  const r = resolve(access);

  const [showDetail, setShowDetail] = useState(false);

  const perLocus = useMemo(
    () => pg.perLocusStats(access, r.animals),
    [access, r.animals],
  );
  const power = useMemo(
    () => pg.panelPower(access, perLocus),
    [access, perLocus],
  );
  const mismatch = useMemo(
    () => pg.panelMismatch(access, r.animals),
    [access, r.animals],
  );

  const [selected, setSelected] = useState(() => initialLocus() || null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 260);
    return () => clearTimeout(t);
  }, []);

  const activeLocus =
    selected && perLocus.some((l) => l.locus === selected)
      ? selected
      : (perLocus.find((l) => l.flagged) || perLocus[0] || {}).locus;

  const detail = useMemo(
    () => (activeLocus ? pg.locusDetail(access, r.animals, activeLocus) : null),
    [access, r.animals, activeLocus],
  );

  const flaggedCount = perLocus.filter((l) => l.flagged).length;

  return (
    <>
      <Toolbar>
        <div className="panel">
          <Icon name="dna" size={15} />
          <span>
            Panel: <b>{access.panel.name}</b> · {power.nLoci} loci · v
            {access.panel.version}
          </span>
        </div>
        <div className="acts">
          <ExportMenu
            items={[
              {
                label: "Per-locus statistics (CSV)",
                icon: "table",
                onClick: () =>
                  exportCsv(
                    buildPerLocusExport({
                      perLocus,
                      panel: access.panel,
                      label: r.label,
                    }),
                  ),
              },
              {
                label: "Allele frequencies — GenAlEx (CSV)",
                icon: "dna",
                onClick: () => exportGenAlEx(access),
              },
              {
                label: "Allele frequencies — Genepop (TXT)",
                icon: "dna",
                onClick: () => exportGenepop(access),
              },
            ]}
          />
          <Link className="manage" href="/admin">
            <Icon name="sliders" size={13} /> Manage panel
          </Link>
        </div>
      </Toolbar>

      {mismatch.mismatched > 0 && (
        <Warn>
          <Icon name="warning" size={14} /> {mismatch.mismatched} profile(s) in
          scope reference a different panel version. Statistics assume{" "}
          {access.panel.id}. <Link href="/admin">Review in Admin →</Link>
        </Warn>
      )}
      {r.tooSmall && (
        <Note>
          <Icon name="info" size={13} /> Small scope (N = {r.n}); per-locus
          statistics are flagged low-confidence.
        </Note>
      )}

      <Section>
        <Overline>Panel power</Overline>
        <div style={{ marginTop: 12 }}>
          {ready ? (
            <PanelPowerKpis power={power} />
          ) : (
            <KpiSkeleton>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} />
              ))}
            </KpiSkeleton>
          )}
        </div>
      </Section>

      {exec && !showDetail && (
        <ExecBar>
          <span>Executive view — simplified.</span>
          <button type="button" onClick={() => setShowDetail(true)}>
            Show analyst detail
          </button>
        </ExecBar>
      )}

      {!(exec && !showDetail) && (
        <Card style={{ marginTop: 16 }}>
          <PanelHead>
            <Overline>
              Per-locus statistics{" "}
              {flaggedCount > 0 && (
                <em className="flag">{flaggedCount} flagged</em>
              )}
            </Overline>
          </PanelHead>
          {ready ? (
            <PerLocusTable
              perLocus={perLocus}
              selected={activeLocus}
              onSelect={setSelected}
            />
          ) : (
            <Skeleton>
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} />
              ))}
            </Skeleton>
          )}
        </Card>
      )}

      <Grid>
        {!(exec && !showDetail) && (
          <Card>
            <PanelHead>
              <Overline>Locus detail</Overline>
            </PanelHead>
            {ready ? (
              <LocusDetail detail={detail} />
            ) : (
              <Skeleton>
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} />
                ))}
              </Skeleton>
            )}
          </Card>
        )}
        <FillCard>
          <PanelHead>
            <Overline>Informativeness ranking</Overline>
          </PanelHead>
          {ready ? (
            <InformativenessRanking
              perLocus={perLocus}
              selected={activeLocus}
              onSelect={setSelected}
            />
          ) : (
            <Skeleton>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} />
              ))}
            </Skeleton>
          )}
        </FillCard>
      </Grid>
    </>
  );
}

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;

  .panel {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  .panel b {
    color: var(--fg);
  }
  .acts {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .manage {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: var(--text-sm);
    color: var(--accent);
  }
`;

const Warn = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  padding: 10px 12px;
  border: 1px solid var(--danger);
  background: color-mix(in srgb, var(--danger) 8%, var(--surface));
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--fg-secondary);

  a {
    color: var(--danger);
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

const Section = styled.div``;

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 16px;
  margin-top: 16px;
  align-items: stretch;
`;

const FillCard = styled(Card)`
  display: flex;
  flex-direction: column;

  > :last-child {
    flex: 1;
    min-height: 0;
  }
`;

const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;

  .flag {
    margin-inline-start: 8px;
    font-style: normal;
    font-size: var(--text-xs);
    color: var(--danger);
    background: color-mix(in srgb, var(--danger) 12%, transparent);
    padding: 1px 8px;
    border-radius: var(--radius-pill);
  }
`;

const KpiSkeleton = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;

  span {
    height: 92px;
    border-radius: var(--radius-lg);
    background: linear-gradient(
      90deg,
      var(--surface-2) 25%,
      var(--surface) 50%,
      var(--surface-2) 75%
    );
    background-size: 200% 100%;
    animation: sh 1.2s infinite;
  }
  @keyframes sh {
    to {
      background-position: -200% 0;
    }
  }
`;

const Skeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;

  span {
    height: 28px;
    border-radius: var(--radius-md);
    background: linear-gradient(
      90deg,
      var(--surface-2) 25%,
      var(--surface) 50%,
      var(--surface-2) 75%
    );
    background-size: 200% 100%;
    animation: sh 1.2s infinite;
  }
  @keyframes sh {
    to {
      background-position: -200% 0;
    }
  }
`;
