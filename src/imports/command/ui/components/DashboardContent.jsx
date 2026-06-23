"use client";

import React, { useMemo } from "react";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { useCommandCenter } from "@/imports/command/hooks/useCommandCenter.js";
import { CommandHeader } from "@/imports/command/ui/components/CommandHeader.jsx";
import { HeroBand } from "@/imports/command/ui/components/HeroBand.jsx";
import { NationalOverview } from "@/imports/command/ui/components/NationalOverview.jsx";
import { IntelligenceHighlights } from "@/imports/command/ui/components/IntelligenceHighlights.jsx";
import { buildCommandData } from "@/imports/command/ui/components/data.js";

export function DashboardContent() {
  const { access } = useDataset();
  const { period, setPeriod, executive, setExecutive } = useCommandCenter();

  const data = useMemo(
    () => (access ? buildCommandData(access, period) : null),
    [access, period],
  );

  if (!data) return null;

  return (
    <>
      <CommandHeader
        period={period}
        setPeriod={setPeriod}
        executive={executive}
        setExecutive={setExecutive}
      />
      <HeroBand tiles={data.hero} />
      <NationalOverview
        executive={executive}
        regions={data.regions}
        hetBins={data.hetBins}
        inbrBins={data.inbrBins}
        richnessGauge={data.richnessGauge}
      />
      <IntelligenceHighlights
        executive={executive}
        alerts={data.alerts}
        clusters={data.clusters}
        activity={data.activity}
      />
    </>
  );
}
