"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Select } from "@/imports/core/components/Select.jsx";
import { Histogram } from "@/imports/core/components/Histogram.jsx";
import { BarList } from "@/imports/core/components/BarList.jsx";
import { RegionMap } from "@/imports/core/components/RegionMap.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { HoHeChart } from "./HoHeChart.jsx";
import { MiniPcoa } from "./MiniPcoa.jsx";
import { TimeSeriesChart } from "./TimeSeriesChart.jsx";
import { CardPanel } from "./CardPanel.jsx";
import { REGION_METRICS } from "./dashboardHelpers.js";

export function HoHeCard({ perLocus }) {
  return (
    <CardPanel title="Ho vs He per locus">
      <HoHeChart data={perLocus} />
    </CardPanel>
  );
}

export function InbreedingCard({ fBins, meanF }) {
  return (
    <CardPanel
      title="Inbreeding F distribution"
      aside={
        <Link href="/genetics/inbreeding" className="link">
          Inbreeding <Icon name="arrow-right" size={12} />
        </Link>
      }
    >
      <HistoWrap>
        <Histogram bins={fBins} height={120} />
        <span
          className="mean"
          style={{ left: `${Math.min(100, (meanF / 0.35) * 100)}%` }}
          title={`Population mean F = ${meanF}`}
        >
          <i />
          <em>mean {meanF}</em>
        </span>
      </HistoWrap>
      <Axis>
        <span>F = 0</span>
        <span>0.35</span>
      </Axis>
    </CardPanel>
  );
}

export function RichnessCard({ perLocus }) {
  return (
    <CardPanel title="Allele richness per locus">
      <BarList
        data={perLocus
          .slice()
          .sort((a, b) => b.na - a.na)
          .map((l) => ({ label: l.locus, value: l.na }))}
        renderHref={(d) => `/genetics/markers?locus=${d.label}`}
      />
    </CardPanel>
  );
}

export function SpectrumCard({ spectrum, locus, setLocus, loci }) {
  return (
    <CardPanel
      title="Allele-frequency spectrum"
      aside={
        <Select
          size="sm"
          value={locus}
          onChange={setLocus}
          options={loci.map((l) => ({
            value: l.locusName,
            label: l.locusName,
          }))}
        />
      }
    >
      <BarList
        data={spectrum.map((s) => ({ label: s.allele, value: s.freq }))}
        color="var(--status-info, var(--accent))"
      />
    </CardPanel>
  );
}

export function StructurePreviewCard({ pcoa, breeds }) {
  return (
    <CardPanel
      title="Population structure preview"
      aside={
        <Link href="/genetics/structure" className="link">
          Open Structure <Icon name="arrow-right" size={12} />
        </Link>
      }
    >
      <MiniPcoa points={pcoa.points} breeds={breeds} height={220} />
    </CardPanel>
  );
}

export function TimeSeriesCard({ time }) {
  return (
    <FillPanel title="Diversity over time">
      <TimeSeriesChart data={time} />
    </FillPanel>
  );
}

export function GeographicCard({
  regionData,
  regionMetric,
  setRegionMetric,
  onSelect,
}) {
  return (
    <SpacedPanel
      title="Geographic diversity"
      aside={
        <Select
          size="sm"
          value={regionMetric}
          onChange={setRegionMetric}
          options={REGION_METRICS}
        />
      }
    >
      <RegionMap data={regionData} onSelect={onSelect} />
    </SpacedPanel>
  );
}

const SpacedPanel = styled(CardPanel)`
  margin-top: 16px;
`;

const FillPanel = styled(CardPanel)`
  display: flex;
  flex-direction: column;
  height: 100%;

  > :last-child {
    flex: 1;
    min-height: 0;
  }
`;

const HistoWrap = styled.div`
  position: relative;

  .mean {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    pointer-events: none;
  }
  .mean i {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--danger);
    transform: translateX(-1px);
  }
  .mean em {
    position: absolute;
    top: -2px;
    left: 4px;
    font-style: normal;
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--danger);
    white-space: nowrap;
  }
`;

const Axis = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--fg-subtle);
`;
