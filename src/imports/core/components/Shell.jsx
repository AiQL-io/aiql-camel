"use client";

import React from "react";
import styled from "styled-components";
import { TopBar } from "./TopBar.jsx";
import { NavRail } from "./NavRail.jsx";
import { AssistantBar } from "@/imports/core/components/AssistantBar.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";

const DEFAULT_USER = {
  name: "Nora Al-Sulaiman",
  role: "Geneticist",
  avatar: "/assets/avatars/nora.png",
};

export function Shell({
  title,
  crumbs,
  user = DEFAULT_USER,
  assistant = true,
  children,
}) {
  const { t } = useI18n();
  return (
    <Root className="aiql-dotted">
      <TopBar title={title} crumbs={crumbs} user={user} />
      <NavRail />
      <main>{children}</main>
      {assistant && (
        <div className="assistant">
          <AssistantBar
            placeholder={t("common.askAnything")}
            style={{ width: 460 }}
          />
        </div>
      )}
    </Root>
  );
}

const Root = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;

  main {
    position: absolute;
    top: 64px;
    inset-inline: 0;
    bottom: 0;
    overflow: auto;
  }
  .assistant {
    position: absolute;
    inset-inline-end: 28px;
    bottom: 24px;
    z-index: 25;
  }
`;
