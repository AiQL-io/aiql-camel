"use client";

import React from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";

export function ModulePlaceholder({ icon, titleKey, descKey }) {
  const { t } = useI18n();
  return (
    <Root>
      <div className="head">
        <span className="glyph">
          <Icon name={icon} size={28} />
        </span>
        <h1 className="title">{t(titleKey)}</h1>
        <Chip tone="accent">In progress</Chip>
      </div>
      <p className="desc">
        {descKey
          ? t(descKey)
          : "This module's screens are being built next, per the Manhal build plan."}
      </p>
    </Root>
  );
}

const Root = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 40px;

  .head {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .glyph {
    color: var(--accent);
  }
  .title {
    font-size: var(--text-xl);
    font-weight: var(--weight-semibold);
  }
  .desc {
    color: var(--fg-muted);
    margin-top: 12px;
    max-width: 560px;
  }
`;
