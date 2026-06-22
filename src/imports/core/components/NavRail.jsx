"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { usePathname } from "next/navigation";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Tooltip } from "@/imports/core/components/Tooltip.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { MODULES, activeModuleId } from "@/imports/core/components/nav.js";

export function NavRail() {
  const pathname = usePathname();
  const active = activeModuleId(pathname);
  const { t } = useI18n();
  const { can } = useRole();
  const modules = MODULES.filter((m) => !m.cap || can(m.cap));

  return (
    <Rail aria-label="Primary">
      {modules.map((m) => {
        const on = m.id === active;
        return (
          <Tooltip key={m.id} label={t(m.labelKey)} side="right">
            <NavLink
              href={m.href}
              aria-label={t(m.labelKey)}
              aria-current={on ? "page" : undefined}
              $on={on}
            >
              <Icon name={m.icon} size={20} weight={on ? "fill" : "regular"} />
            </NavLink>
          </Tooltip>
        );
      })}
    </Rail>
  );
}

const Rail = styled.nav`
  position: absolute;
  inset-inline-start: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-card);
  z-index: 20;

  @media (max-width: 768px) {
    inset-inline-start: 12px;
    inset-inline-end: 12px;
    top: auto;
    bottom: 12px;
    transform: none;
    flex-direction: row;
    justify-content: space-around;
    gap: 2px;
    border-radius: var(--radius-lg);
  }
`;

const NavLink = styled(Link)`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => (p.$on ? "var(--accent-soft)" : "transparent")};
  color: ${(p) => (p.$on ? "var(--accent)" : "var(--fg-subtle)")};
  transition:
    background 120ms ease,
    color 120ms ease;
`;
