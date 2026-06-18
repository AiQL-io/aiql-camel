"use client";

import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { exportCsv } from "@/imports/verify/ui/components/exporters.js";
import { useGeneticsState } from "@/imports/genetics/state/scopeStore.js";
import * as pg from "@/imports/genetics/engine/popgen.js";
import {
  buildDiversityModel,
  buildDiversityExport,
} from "./dashboard/dashboardHelpers.js";
import { DashboardToolbar } from "./dashboard/DashboardToolbar.jsx";
import { DashboardEmptyState } from "./dashboard/DashboardEmptyState.jsx";
import { DashboardKpis } from "./dashboard/DashboardKpis.jsx";
import { InsightPanel } from "./dashboard/InsightPanel.jsx";
import {
  HoHeCard,
  InbreedingCard,
  RichnessCard,
  SpectrumCard,
  StructurePreviewCard,
  TimeSeriesCard,
  GeographicCard,
} from "./dashboard/DashboardCharts.jsx";

export function DashboardView({ access }) {
  const { audience, resolve, setScopeFilters, setScopeAll } =
    useGeneticsState();
  const r = resolve(access);
  const exec = audience === "executive";

  const [locus, setLocus] = useState(access.panel.loci[0].locusName);
  const [regionMetric, setRegionMetric] = useState("he");
  const [period, setPeriod] = useState("all");

  const animals = useMemo(
    () => pg.filterByPeriod(access, r.animals, period),
    [access, r.animals, period],
  );

  const model = useMemo(
    () => buildDiversityModel(access, animals),
    [access, animals],
  );

  const { perLocus, div, time, insights, pcoa, fBins } = model;
  const spectrum = useMemo(
    () => pg.alleleFreqSpectrum(access, locus),
    [access, locus],
  );
  const regionData = useMemo(
    () => pg.regionDiversity(access, animals, regionMetric),
    [access, animals, regionMetric],
  );

  const onExport = () => {
    exportCsv(
      buildDiversityExport({ access, perLocus, div, label: r.label, period }),
    );
  };

  const toolbar = (
    <DashboardToolbar
      period={period}
      setPeriod={setPeriod}
      onExport={onExport}
    />
  );

  if (animals.length === 0) {
    return (
      <>
        {toolbar}
        <DashboardEmptyState onReset={setScopeAll} />
      </>
    );
  }

  const insightPanel = <InsightPanel insights={insights} />;
  const structurePreviewCard = (
    <StructurePreviewCard pcoa={pcoa} breeds={access.facets.breeds} />
  );
  const timeSeriesCard = <TimeSeriesCard time={time} />;
  const geographicCard = (
    <GeographicCard
      regionData={regionData}
      regionMetric={regionMetric}
      setRegionMetric={setRegionMetric}
      onSelect={(region) => setScopeFilters({ region })}
    />
  );

  return (
    <>
      {toolbar}
      <DashboardKpis div={div} time={time} />
      {exec ? (
        <>
          <TwoCol style={{ marginTop: 16 }}>
            <div className="wide">{insightPanel}</div>
            {structurePreviewCard}
          </TwoCol>
          {timeSeriesCard}
          {geographicCard}
        </>
      ) : (
        <>
          <CompositionRow style={{ marginTop: 16 }}>
            <div className="composition">
              <HoHeCard perLocus={perLocus} />
              <InbreedingCard fBins={fBins} meanF={div.meanF} />
              <RichnessCard perLocus={perLocus} />
              <SpectrumCard
                spectrum={spectrum}
                locus={locus}
                setLocus={setLocus}
                loci={access.panel.loci}
              />
            </div>
            <div className="insightcol">{insightPanel}</div>
          </CompositionRow>
          <TwoCol style={{ marginTop: 16 }}>
            {structurePreviewCard}
            {timeSeriesCard}
          </TwoCol>
          {geographicCard}
        </>
      )}
    </>
  );
}

const CompositionRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;

  .composition {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }
  .insightcol {
    min-width: 0;
    position: sticky;
    top: 24px;
  }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;

  .wide {
    min-width: 0;
  }
`;
