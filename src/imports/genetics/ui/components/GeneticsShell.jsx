"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { SegmentedControl } from "@/imports/core/components/SegmentedControl.jsx";
import { BackToHome } from "@/imports/core/components/BackToHome.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";
import {
  useGeneticsState,
  serializeState,
  applyStateFromParams,
} from "@/imports/genetics/state/scopeStore.js";
import { ScopeBar } from "./ScopeBar.jsx";
import { MethodsDrawer } from "./MethodsDrawer.jsx";

const NAV = [
  { href: "/genetics", labelKey: "genetics.tab.dashboard", exact: true },
  { href: "/genetics/structure", labelKey: "genetics.tab.structure" },
  { href: "/genetics/relatedness", labelKey: "genetics.tab.relatedness" },
  { href: "/genetics/inbreeding", labelKey: "genetics.tab.inbreeding" },
  { href: "/genetics/clusters", labelKey: "genetics.tab.clusters" },
  { href: "/genetics/cohorts", labelKey: "genetics.tab.cohorts" },
  { href: "/genetics/markers", labelKey: "genetics.tab.markers" },
  { href: "/genetics/evo", labelKey: "genetics.tab.evo" },
  { href: "/genetics/methods", labelKey: "genetics.tab.methods" },
];

export function GeneticsShell({ access, children }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { state, scope, audience, setAudience } = useGeneticsState();
  const isEvo = pathname.startsWith("/genetics/evo");

  useEffect(() => {
    if (typeof window === "undefined") return;
    applyStateFromParams(new URLSearchParams(window.location.search));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const qs = serializeState(state);
    const url = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [state, scope, audience]);

  return (
    <Wrap>
      <BackToHome />
      <header className="gh">
        <Overline>{t("genetics.overline")}</Overline>
        <h1>{t("nav.genetics")}</h1>
      </header>

      <nav className={isEvo ? "subnav bare" : "subnav"}>
        {NAV.map((n) => {
          const active = n.exact
            ? pathname === n.href
            : pathname.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={active ? "on" : ""}>
              {t(n.labelKey)}
            </Link>
          );
        })}
      </nav>

      {!isEvo && (
        <>
          <div className="bar">
            {access && <ScopeBar access={access} />}
            <div className="audience">
              <span className="al">{t("common.audience")}</span>
              <SegmentedControl
                value={audience}
                onChange={setAudience}
                options={[
                  { value: "analyst", label: t("common.analyst") },
                  { value: "executive", label: t("common.executive") },
                ]}
              />
            </div>
          </div>

          <p className="proto-note">{t("genetics.protoNote")}</p>
        </>
      )}

      <div className="body">{children}</div>
      <MethodsDrawer />
    </Wrap>
  );
}

const Wrap = styled.div`
  max-width: 1500px;
  margin: 0 auto;
  padding: 80px 40px 96px 128px;

  @media (max-width: 768px) {
    padding: 72px 16px 96px 16px;
  }
  animation: aiql-fade-in 220ms ease-out;

  .gh h1 {
    font-size: var(--text-2xl);
    line-height: 40px;
    font-weight: var(--weight-medium);
    letter-spacing: -0.02em;
    margin-top: 8px;
  }
  .subnav {
    display: flex;
    gap: 4px;
    margin-top: 20px;
    flex-wrap: wrap;
  }
  .subnav.bare {
    border-bottom: none;
  }
  .subnav a {
    padding: 10px 14px;
    font-size: var(--text-sm);
    color: var(--fg-subtle);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    white-space: nowrap;
  }
  .subnav a:hover {
    color: var(--fg);
  }
  .subnav a.on {
    color: var(--accent);
    border-bottom-color: var(--accent);
    font-weight: var(--weight-medium);
  }
  .bar {
    display: flex;
    align-items: stretch;
    gap: 12px;
  }
  .bar > div:first-child {
    flex: 1;
    min-width: 0;
  }
  .audience {
    display: flex;
    flex-direction: column;
    gap: 6px;
    justify-content: center;
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
  }
  .audience .al {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .proto-note {
    margin-top: 16px;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-inline-start: 3px solid var(--accent);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    line-height: 1.5;
  }
  .body {
    margin-top: 20px;
  }
`;
