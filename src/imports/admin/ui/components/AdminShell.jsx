"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";

const NAV = [
  { href: "/admin", labelKey: "admin.tab.users", exact: true },
  { href: "/admin/panels", labelKey: "admin.tab.panels" },
  { href: "/admin/reference", labelKey: "admin.tab.reference" },
  { href: "/admin/audit", labelKey: "admin.tab.audit" },
];

export function AdminShell({ children }) {
  const pathname = usePathname();
  const { can } = useRole();
  const { t } = useI18n();
  const isAdmin = can("manageAdmin");
  return (
    <Wrap>
      <header className="ah">
        <Overline>{t("admin.overline")}</Overline>
        <h1>{t("nav.admin")}</h1>
      </header>
      {!isAdmin && (
        <ReadOnly>
          <Icon name="lock-simple" size={14} /> View-only — administration
          actions require the Platform Admin role. Switch persona in the top bar
          to manage.
        </ReadOnly>
      )}
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

  @media (max-width: 768px) {
    padding: 72px 16px 96px 16px;
  }
  animation: aiql-fade-in 220ms ease-out;

  .ah h1 {
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

const ReadOnly = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--fg-secondary);
`;
