"use client";

import React from "react";
import styled from "styled-components";
import { Skeleton } from "@/imports/core/components/Skeleton.jsx";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { CamelProfileView } from "@/imports/registry/ui/components/CamelProfileView.jsx";

export default function CamelProfilePage({ id }) {
  const { access, loading } = useDataset();
  if (loading || !access) {
    return (
      <Page>
        <Skeleton width={120} height={16} style={{ marginBottom: 20 }} />
        <Skeleton width={320} height={32} style={{ marginBottom: 24 }} />
        <Skeleton height={300} radius="var(--radius-lg)" />
      </Page>
    );
  }
  return (
    <Page>
      <CamelProfileView access={access} id={id} />
    </Page>
  );
}

const Page = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 40px 96px 128px;
  animation: aiql-fade-in 220ms ease-out;
`;
