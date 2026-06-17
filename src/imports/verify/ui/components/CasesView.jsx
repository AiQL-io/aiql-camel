"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { useCases } from "@/imports/verify/state/caseStore.js";
import { CasesEmpty } from "./CasesEmpty.jsx";
import { CasesList } from "./CasesList.jsx";
import { CaseDetail } from "./CaseDetail.jsx";

export function CasesView() {
  const {
    cases,
    transitionCase,
    addNote,
    issueCertificate,
    revokeCertificate,
  } = useCases();
  const { user, can } = useRole();
  const [selId, setSelId] = useState(null);
  const [filter, setFilter] = useState("");

  const list = filter ? cases.filter((c) => c.status === filter) : cases;
  const sel = cases.find((c) => c.id === selId) || list[0] || null;
  const canApprove = can("resolveIntegrity");

  if (cases.length === 0) return <CasesEmpty />;

  return (
    <Layout>
      <CasesList
        cases={cases}
        list={list}
        filter={filter}
        setFilter={setFilter}
        selId={sel?.id}
        setSelId={setSelId}
      />
      {sel && (
        <CaseDetail
          sel={sel}
          user={user}
          can={can}
          canApprove={canApprove}
          transitionCase={transitionCase}
          issueCertificate={issueCertificate}
          revokeCertificate={revokeCertificate}
          addNote={addNote}
        />
      )}
    </Layout>
  );
}

const Layout = styled.div`
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 16px;
  align-items: start;

  @media (max-width: 940px) {
    grid-template-columns: 1fr;
  }

  > * {
    min-width: 0;
  }
`;
