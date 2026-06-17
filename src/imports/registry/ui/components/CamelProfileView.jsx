"use client";

import React, { useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Tabs } from "@/imports/core/components/Tabs.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { useCamelProfile } from "@/imports/registry/hooks/useCamelProfile.js";
import { ProfileHeader } from "./ProfileHeader.jsx";
import { ProfileBanners } from "./ProfileBanners.jsx";
import { OverviewTab } from "./OverviewTab.jsx";
import { DnaTab } from "./DnaTab.jsx";
import { ParentageTab } from "./ParentageTab.jsx";
import { RelativesTab } from "./RelativesTab.jsx";
import { IntegrityTab } from "./IntegrityTab.jsx";
import { DocumentsTab } from "./DocumentsTab.jsx";
import { HistoryTab } from "./HistoryTab.jsx";

export function CamelProfileView({ access, id }) {
  const p = useCamelProfile(access, id);
  const { can } = useRole();
  const [tab, setTab] = useState("overview");
  const [compareId, setCompareId] = useState("");

  if (p.notFound) {
    return (
      <Wrap>
        <Link href="/registry" className="back">
          <Icon name="arrow-left" size={14} /> Registry
        </Link>
        <h1 style={{ marginTop: 16 }}>Animal not found</h1>
      </Wrap>
    );
  }

  const {
    animal,
    profile,
    offspring,
    fullSibs,
    declaredSire,
    declaredDam,
    bioSire,
    bioDam,
    sireCheck,
    damCheck,
    flags,
    rankedRelatives,
    pedigree,
  } = p;

  const TABS = [
    { value: "overview", label: "Overview" },
    { value: "dna", label: "DNA" },
    { value: "parentage", label: "Parentage" },
    { value: "relatives", label: `Relatives (${rankedRelatives.length})` },
    { value: "integrity", label: `Integrity (${flags.length})` },
    { value: "documents", label: "Documents" },
    { value: "history", label: "History" },
  ];

  return (
    <Wrap>
      <Link href="/registry" className="back">
        <Icon name="arrow-left" size={14} /> Registry
      </Link>

      <ProfileHeader animal={animal} flags={flags} can={can} />
      <ProfileBanners animal={animal} />

      <div className="tabs">
        <Tabs items={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="panel">
        {tab === "overview" && (
          <OverviewTab
            animal={animal}
            offspring={offspring}
            fullSibs={fullSibs}
            rankedRelatives={rankedRelatives}
            flags={flags}
          />
        )}
        {tab === "dna" && (
          <DnaTab
            access={access}
            animal={animal}
            profile={profile}
            compareId={compareId}
            setCompareId={setCompareId}
            can={can}
          />
        )}
        {tab === "parentage" && (
          <ParentageTab
            animal={animal}
            profile={profile}
            declaredSire={declaredSire}
            declaredDam={declaredDam}
            bioSire={bioSire}
            bioDam={bioDam}
            sireCheck={sireCheck}
            damCheck={damCheck}
            pedigree={pedigree}
          />
        )}
        {tab === "relatives" && (
          <RelativesTab animal={animal} rankedRelatives={rankedRelatives} />
        )}
        {tab === "integrity" && <IntegrityTab flags={flags} />}
        {tab === "documents" && <DocumentsTab animal={animal} />}
        {tab === "history" && (
          <HistoryTab access={access} animal={animal} profile={profile} />
        )}
      </div>
    </Wrap>
  );
}

const Wrap = styled.div`
  .back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  h1 {
    font-size: var(--text-2xl);
    line-height: 36px;
    font-weight: var(--weight-medium);
    letter-spacing: -0.02em;
  }
  .tabs {
    margin-top: 24px;
  }
  .panel {
    margin-top: 16px;
  }
`;
