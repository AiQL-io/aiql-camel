"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { usePathname } from "next/navigation";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Tooltip } from "@/imports/core/components/Tooltip.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";
import { MODULES, activeModuleId } from "@/imports/core/components/nav.js";

export function NavRail() {
  const pathname = usePathname();
  const active = activeModuleId(pathname);
  const { t } = useI18n();

  return (
    <Rail aria-label="Primary">
      {MODULES.map((m) => {
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
