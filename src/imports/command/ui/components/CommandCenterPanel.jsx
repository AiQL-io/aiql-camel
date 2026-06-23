"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";
import {
  useCommandCenterOpen,
  closeCommandCenter,
} from "@/imports/command/state/commandCenterStore.js";
import { DashboardContent } from "./DashboardContent.jsx";

export function CommandCenterPanel() {
  const open = useCommandCenterOpen();
  const { t } = useI18n();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeCommandCenter();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <Scrim $open={open} onClick={closeCommandCenter} aria-hidden={!open} />
      <Panel
        $open={open}
        role="dialog"
        aria-modal="true"
        aria-label={t("command.title")}
      >
        <header className="ph">
          <span className="ph-title">
            <Icon name="gauge" size={15} />
            {t("command.title")}
          </span>
          <button
            type="button"
            className="close"
            onClick={closeCommandCenter}
            aria-label="Close"
          >
            <Icon name="x" size={16} />
          </button>
        </header>
        <div className="pbody">{open && <DashboardContent />}</div>
      </Panel>
    </>
  );
}

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 60;
  background: #0008;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};
  transition: opacity 200ms ease;
`;

const Panel = styled.aside`
  position: fixed;
  top: 0;
  bottom: 0;
  inset-inline-end: 0;
  z-index: 61;
  width: min(880px, 94vw);
  background: var(--bg);
  border-inline-start: 1px solid var(--border);
  box-shadow: var(--shadow-popover);
  display: flex;
  flex-direction: column;
  transform: translateX(${(p) => (p.$open ? "0" : "100%")});
  transition: transform 240ms cubic-bezier(0.4, 0, 0.2, 1);

  html[dir="rtl"] & {
    transform: translateX(${(p) => (p.$open ? "0" : "-100%")});
  }

  .ph {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 56px;
    padding: 0 28px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .ph-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-subtle);
  }
  .close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid var(--border);
    background: var(--surface);
    border-radius: var(--radius-pill);
    color: var(--fg-secondary);
    cursor: pointer;
    flex-shrink: 0;
  }
  .close:hover {
    background: var(--surface-2);
    color: var(--fg);
  }
  .pbody {
    flex: 1;
    overflow-y: auto;
    padding: 20px 28px 40px;
  }

  @media (max-width: 768px) {
    width: 100vw;
    .ph,
    .pbody {
      padding-inline: 16px;
    }
  }
`;
