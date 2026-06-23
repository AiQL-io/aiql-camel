"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";

export function BackToHome() {
  const { t } = useI18n();
  return (
    <Back href="/">
      <Icon name="arrow-left" size={13} />
      {t("nav.backToHome")}
    </Back>
  );
}

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  font-size: var(--text-xs);
  color: var(--fg-subtle);
  transition: color 120ms ease;

  &:hover {
    color: var(--accent);
  }

  html[dir="rtl"] & i {
    transform: scaleX(-1);
  }
`;
