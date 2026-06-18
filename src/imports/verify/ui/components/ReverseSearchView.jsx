"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { useRouter } from "next/navigation";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { useReverseSearch } from "@/imports/verify/hooks/useReverseSearch.js";
import { useCases } from "@/imports/verify/state/caseStore.js";
import { ReverseSearchParams } from "./ReverseSearchParams.jsx";
import { ReverseSearchResults } from "./ReverseSearchResults.jsx";
import { exportCsv } from "./exporters.js";

export function ReverseSearchView({ access }) {
  const rs = useReverseSearch(access);
  const { can } = useRole();
  const { createCase, setActiveCase } = useCases();
  const router = useRouter();

  const finalizeSelected = () => {
    if (!rs.offspringId || !rs.selectedId) return;
    const role = rs.target === "dam" ? "dam" : "sire";
    const res = access.verify(rs.offspringId, rs.selectedId, {
      tolerance: rs.tolerance,
    });
    const snap = (a) => {
      const p = a ? access.getProfile(a.id) : null;
      return a
        ? {
            id: a.id,
            name: a.name,
            reg: a.registrationId,
            sex: a.sex,
            genotypes: p ? p.genotypes.map((g) => ({ ...g })) : [],
          }
        : null;
    };
    const c = createCase({
      type: role === "dam" ? "maternity" : "paternity",
      subjects: { offspring: snap(rs.offspring), [role]: snap(rs.selected) },
      verdict: res?.verdict || "consistent",
      stats: {
        lociCompared: res?.lociCompared,
        mismatchCount: res?.mismatchCount,
        cpe: res?.cpe,
        parentageIndex: res?.parentageIndex,
        tolerance: rs.tolerance,
      },
      evidence: { mismatchLoci: res?.mismatchLoci || [] },
    });
    setActiveCase(c.id);
    router.push("/verify/cases");
  };

  if (!can("runAnalysis")) {
    return (
      <Card>
        <RO>
          <Icon name="lock-simple" size={16} /> View-only role — switch to
          Geneticist, Technician, or Registrar to run reverse search.
        </RO>
      </Card>
    );
  }

  const res = rs.result;
  const survivors = res?.survivors || [];
  const exactCount = survivors.filter((s) => s.mismatchCount === 0).length;

  const exportCandidates = () =>
    exportCsv({
      filename: `reverse-search-${rs.offspring?.registrationId || "candidates"}.csv`,
      columns: [
        { label: "rank", get: (s) => survivors.indexOf(s) + 1 },
        { label: "candidate", get: (s) => s.animal.registrationId },
        { label: "name", get: (s) => s.animal.name },
        { label: "mismatches", get: (s) => s.mismatchCount },
        {
          label: "parentage_index",
          get: (s) => s.parentageIndex.toExponential(3),
        },
        { label: "relatedness_r", get: (s) => s.r },
        { label: "inferred", get: (s) => s.inferred },
      ],
      rows: survivors,
      provenance: {
        title: `Reverse parentage search (${rs.target})`,
        subjects: `offspring ${rs.offspring?.registrationId} · pool ${res?.poolSize}`,
        panel: access.panel,
        tolerance: rs.tolerance,
        estimator: "Lynch & Ritland (1999)",
      },
    });

  return (
    <Layout>
      <ReverseSearchParams access={access} rs={rs} />
      <ReverseSearchResults
        rs={rs}
        res={res}
        survivors={survivors}
        exactCount={exactCount}
        onExport={exportCandidates}
        onFinalize={finalizeSelected}
      />
    </Layout>
  );
}

const Layout = styled.div`
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 16px;
  align-items: start;

  @media (max-width: 940px) {
    grid-template-columns: 1fr;
  }
`;

const RO = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-sm);
  color: var(--fg-secondary);
`;
