"use client";

import React from "react";
import styled from "styled-components";
import { useCommandCenter } from "@/imports/command/hooks/useCommandCenter.js";
import { CommandHeader } from "@/imports/command/ui/components/CommandHeader.jsx";
import { HeroBand } from "@/imports/command/ui/components/HeroBand.jsx";
import { NationalOverview } from "@/imports/command/ui/components/NationalOverview.jsx";
import { IntelligenceHighlights } from "@/imports/command/ui/components/IntelligenceHighlights.jsx";
import { ModuleLauncher } from "@/imports/command/ui/components/ModuleLauncher.jsx";
import { LoadingState } from "@/imports/command/ui/components/LoadingState.jsx";

export default function CommandCenterPage() {
  const { period, setPeriod, executive, setExecutive, loading } =
    useCommandCenter();

  if (loading) return <LoadingState />;

  return (
    <Page>
      <CommandHeader
        period={period}
        setPeriod={setPeriod}
        executive={executive}
        setExecutive={setExecutive}
      />
      <HeroBand period={period} />
      <NationalOverview executive={executive} />
      <IntelligenceHighlights executive={executive} />
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
