"use client";

import React, { useMemo, useState, useRef } from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { exportCsv } from "@/imports/verify/ui/components/exporters.js";
import { useGeneticsState } from "@/imports/genetics/state/scopeStore.js";
import * as pg from "@/imports/genetics/engine/popgen.js";
import { InbreedingTable } from "./inbreeding/InbreedingTable.jsx";
import { InbreedingToolbar } from "./inbreeding/InbreedingToolbar.jsx";
import { InbreedingEmptyState } from "./inbreeding/InbreedingEmptyState.jsx";
import { InbreedingKpis } from "./inbreeding/InbreedingKpis.jsx";
import { BulkActionsBar } from "./inbreeding/BulkActionsBar.jsx";
import { InbreedingSidebar } from "./inbreeding/InbreedingSidebar.jsx";
import { ExportMenu } from "./ExportMenu.jsx";
import { F_ESTIMATORS } from "./inbreeding/inbreedingHelpers.js";
import {
  FMAX,
  NBINS,
  buildInbreedingAux,
  buildInbreedingExport,
} from "./inbreeding/inbreedingHelpers.js";

export function InbreedingView({ access }) {
  const { resolve, setScopeAll, audience } = useGeneticsState();
  const exec = audience === "executive";
  const r = resolve(access);

  const [estimator, setEstimator] = useState("hl");
  const [threshold, setThreshold] = useState(0.2);
  const [pickedBin, setPickedBin] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [showDetail, setShowDetail] = useState(false);
  const sideRef = useRef(null);

  const rows = useMemo(
    () => pg.inbreedingTable(access, r.animals, estimator),
    [access, r.animals, estimator],
  );
  const aux = useMemo(
    () => buildInbreedingAux(access, r.animals, rows),
    [access, r.animals, rows],
  );

  const { div, fBins, kinBins, founders } = aux;
  const pctAbove = rows.length
    ? Math.round(
        (rows.filter((x) => x.f >= threshold).length / rows.length) * 100,
      )
    : 0;
  const fRange =
    pickedBin == null
      ? null
      : [(pickedBin / NBINS) * FMAX, ((pickedBin + 1) / NBINS) * FMAX];

  const estLabel = F_ESTIMATORS.find((e) => e.value === estimator).label;

  const exportIndividual = () => {
    exportCsv(
      buildInbreedingExport({ access, rows, estimator, label: r.label }),
    );
  };

  const exportKinship = () => {
    exportCsv({
      filename: "manhal_kinship_founders.csv",
      columns: [
        { label: "registration", get: (x) => x.reg },
        { label: "line", get: (x) => x.breed },
        { label: "region", get: (x) => x.region },
        { label: "mean_kinship_to_population", get: (x) => x.meanKinship },
        { label: "relatives", get: (x) => x.relatives },
      ],
      rows: founders,
      provenance: {
        title: `Kinship / founder over-representation — ${r.label}`,
        subjects: `${founders.length} ranked founders`,
        panel: access.panel,
        estimator: estLabel,
      },
    });
  };

  const exportSlot = (
    <ExportMenu
      figureRef={sideRef}
      figureName="manhal_inbreeding_distribution"
      items={[
        {
          label: "Individual F (CSV)",
          icon: "table",
          onClick: exportIndividual,
        },
        {
          label: "Kinship / founders (CSV)",
          icon: "table",
          onClick: exportKinship,
        },
      ]}
    />
  );

  if (r.animals.length === 0) {
    return <InbreedingEmptyState onReset={setScopeAll} />;
  }

  return (
    <>
      <InbreedingToolbar
        estimator={estimator}
        setEstimator={setEstimator}
        threshold={threshold}
        setThreshold={setThreshold}
        exportSlot={exportSlot}
      />

      <Grid>
        <div className="main">
          <InbreedingKpis div={div} threshold={threshold} pctAbove={pctAbove} />

          {selected.size > 0 && !(exec && !showDetail) && (
            <BulkActionsBar
              rows={rows.filter((x) => selected.has(x.id))}
              access={access}
              estimator={estLabel}
              label={r.label}
              onClear={() => setSelected(new Set())}
            />
          )}

          {exec && !showDetail ? (
            <ExecBar>
              <span>Executive view — simplified.</span>
              <button type="button" onClick={() => setShowDetail(true)}>
                Show analyst detail
              </button>
            </ExecBar>
          ) : (
            <TableCard padding={0}>
              <CardHead>
                <Overline>Individual inbreeding</Overline>
                {fRange && (
                  <button
                    type="button"
                    className="clearfilter"
                    onClick={() => setPickedBin(null)}
                  >
                    Filtered F {fRange[0].toFixed(2)}–{fRange[1].toFixed(2)} ·
                    clear
                  </button>
                )}
              </CardHead>
              <InbreedingTable
                rows={rows}
                access={access}
                fRange={fRange}
                selected={selected}
                setSelected={setSelected}
              />
            </TableCard>
          )}
        </div>

        <div className="side" ref={sideRef}>
          <InbreedingSidebar
            fBins={fBins}
            pickedBin={pickedBin}
            setPickedBin={setPickedBin}
            meanF={div.meanF}
            threshold={threshold}
            kinBins={kinBins}
            founders={founders}
          />
        </div>
      </Grid>
    </>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 16px;

  .main,
  .side {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }
`;

const TableCard = styled(Card)`
  margin-top: 12px;
`;

const ExecBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
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

const CardHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 0;

  .clearfilter {
    border: none;
    background: transparent;
    color: var(--accent);
    font-size: var(--text-xs);
    cursor: pointer;
  }
`;
