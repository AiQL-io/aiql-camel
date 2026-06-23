"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { TopBar } from "./TopBar.jsx";
import { NavRail } from "./NavRail.jsx";
import { CommandPalette } from "./CommandPalette.jsx";
import { AssistantBar } from "@/imports/core/components/AssistantBar.jsx";
import { CommandCenterPanel } from "@/imports/command/ui/components/CommandCenterPanel.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";

export function Shell({ title, crumbs, assistant = true, children }) {
  const { t } = useI18n();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Root className="aiql-dotted">
      <TopBar
        title={title}
        crumbs={crumbs}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <NavRail />
      <main>{children}</main>
      <CommandPalette
        key={searchOpen ? "open" : "closed"}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      <CommandCenterPanel />
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

  @media (max-width: 768px) {
    .assistant {
      display: none;
    }
  }
`;
