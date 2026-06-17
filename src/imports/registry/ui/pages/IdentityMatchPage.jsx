"use client";

import React from "react";
import styled from "styled-components";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { IdentityMatchView } from "@/imports/registry/ui/components/IdentityMatchView.jsx";

export default function IdentityMatchPage() {
  const { access } = useDataset();
  return (
    <Page>
      <IdentityMatchView access={access} />
    </Page>
  );
}

const Page = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 40px 96px 128px;
  animation: aiql-fade-in 220ms ease-out;
`;
