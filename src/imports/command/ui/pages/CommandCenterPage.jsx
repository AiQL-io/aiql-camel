"use client";

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { useCommandCenter } from "@/imports/command/hooks/useCommandCenter.js";
import { CommandHeader } from "@/imports/command/ui/components/CommandHeader.jsx";
import { HeroBand } from "@/imports/command/ui/components/HeroBand.jsx";
import { NationalOverview } from "@/imports/command/ui/components/NationalOverview.jsx";
import { IntelligenceHighlights } from "@/imports/command/ui/components/IntelligenceHighlights.jsx";
import { ModuleLauncher } from "@/imports/command/ui/components/ModuleLauncher.jsx";
import { LoadingState } from "@/imports/command/ui/components/LoadingState.jsx";
import { buildCommandData } from "@/imports/command/ui/components/data.js";

export default function CommandCenterPage() {
  const { access } = useDataset();
  const { period, setPeriod, executive, setExecutive } = useCommandCenter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const data = useMemo(
    () => (access ? buildCommandData(access, period) : null),
    [access, period],
  );

  if (loading || !data) return <LoadingState />;

  return (
    <Page>
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
      <ModuleLauncher />
    </Page>
  );
}

const Page = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 80px 40px 96px 128px;
  animation: aiql-fade-in 220ms ease-out;
`;
