"use client";

import React from "react";
import styled from "styled-components";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";
import { ModuleLauncher } from "@/imports/command/ui/components/ModuleLauncher.jsx";

export default function HomePage() {
  const { t } = useI18n();
  return (
    <Page>
      <header className="hh">
        <Overline>{t("app.name")} · National genetic intelligence</Overline>
        <h1>{t("nav.home")}</h1>
      </header>

      <ModuleLauncher />
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

  .hh h1 {
    font-size: var(--text-2xl);
    line-height: 40px;
    font-weight: var(--weight-medium);
    letter-spacing: -0.02em;
    margin-top: 8px;
  }
`;
