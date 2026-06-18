"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";

const NAV = [
  { href: "/reports", labelKey: "reports.tab.generate", exact: true },
  { href: "/reports/templates", labelKey: "reports.tab.templates" },
  { href: "/reports/history", labelKey: "reports.tab.history" },
  { href: "/reports/verify", labelKey: "reports.tab.verify" },
];

export function ReportsShell({ children }) {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <Wrap>
      <header className="rh">
        <Overline>{t("reports.overline")}</Overline>
        <h1>{t("nav.reports")}</h1>
      </header>
      <nav className="subnav">
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
      <div className="body">{children}</div>
    </Wrap>
  );
}

const Wrap = styled.div`
  max-width: 1500px;
  margin: 0 auto;
  padding: 80px 40px 96px 128px;
  animation: aiql-fade-in 220ms ease-out;

  .rh h1 {
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
    border-bottom: 1px solid var(--border);
  }
  .subnav a {
    padding: 10px 14px;
    font-size: var(--text-sm);
    color: var(--fg-subtle);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
  }
  .subnav a:hover {
    color: var(--fg);
  }
  .subnav a.on {
    color: var(--accent);
    border-bottom-color: var(--accent);
    font-weight: var(--weight-medium);
  }
  .body {
    margin-top: 24px;
  }
`;
