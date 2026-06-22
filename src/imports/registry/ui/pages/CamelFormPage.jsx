"use client";

import React from "react";
import styled from "styled-components";
import { useDataset } from "@/imports/core/data/useDataset.js";
import { CamelFormView } from "@/imports/registry/ui/components/CamelFormView.jsx";

export default function CamelFormPage({ id }) {
  const { access } = useDataset();
  return (
    <Page>
      <CamelFormView access={access} id={id} />
    </Page>
  );
}

const Page = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 40px 96px 128px;

  @media (max-width: 768px) {
    padding: 72px 16px 96px 16px;
  }
  animation: aiql-fade-in 220ms ease-out;
`;
