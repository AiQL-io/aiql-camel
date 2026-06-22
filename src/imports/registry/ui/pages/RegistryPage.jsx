"use client";

import React from "react";
import styled from "styled-components";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Skeleton } from "@/imports/core/components/Skeleton.jsx";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { RegistryView } from "@/imports/registry/ui/components/RegistryView.jsx";

function RegistryLoading() {
  return (
    <Page>
      <Chip
        tone="accent"
        leadingIcon={<Icon name="circle-notch" size={12} />}
        style={{ marginBottom: 16 }}
      >
        Building national dataset…
      </Chip>
      <Skeleton width={260} height={28} style={{ marginBottom: 20 }} />
      <Skeleton
        height={48}
        radius="var(--radius-lg)"
        style={{ marginBottom: 16 }}
      />
      <Skeleton height={560} radius="var(--radius-lg)" />
    </Page>
  );
}

export default function RegistryPage() {
  const { access, loading } = useDataset();
  if (loading || !access) return <RegistryLoading />;
  return (
    <Page>
      <RegistryView access={access} />
    </Page>
  );
}

const Page = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 80px 40px 96px 128px;

  @media (max-width: 768px) {
    padding: 72px 16px 96px 16px;
  }
  animation: aiql-fade-in 220ms ease-out;
`;
