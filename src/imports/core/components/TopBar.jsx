"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Logo } from "@/imports/core/components/Logo.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { IconButton } from "@/imports/core/components/IconButton.jsx";
import { Avatar } from "@/imports/core/components/Avatar.jsx";
import { SearchPill } from "@/imports/core/components/SearchPill.jsx";
import { useTheme } from "@/imports/core/providers/ThemeProvider.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";

export function TopBar({ onOpenSearch }) {
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLocale } = useI18n();
  const { user, roles, roleId, setRole } = useRole();
  const [menu, setMenu] = useState(false);

  return (
    <Header>
      <Logo variant="full" size={36} productName={t("app.name")} />

      <div className="actions">
        <SearchPill placeholder={t("common.search")} onClick={onOpenSearch} />
        <div className="bell-wrap">
          <IconButton name="bell" aria-label="Notifications" />
          <span className="bell-badge" />
        </div>
        <IconButton
          name="translate"
          aria-label="Toggle language"
          onClick={toggleLocale}
        />
        <IconButton
          name={theme === "dark" ? "moon" : "sun"}
          aria-label="Toggle theme"
          onClick={toggleTheme}
        />
        <div className="role-wrap">
          <button
            type="button"
            className="profile"
            onClick={() => setMenu((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menu}
          >
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
            <span className="profile-meta">
              <span className="profile-name">{user?.name}</span>
              <span className="profile-role">{user?.role}</span>
            </span>
            <Icon name="caret-down" size={14} color="var(--fg-subtle)" />
          </button>
          {menu && (
            <>
              <div className="scrim" onClick={() => setMenu(false)} />
              <div className="role-menu" role="menu">
                <div className="rm-head">Switch role (demo)</div>
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={r.id === roleId}
                    className={r.id === roleId ? "rm-item on" : "rm-item"}
                    onClick={() => {
                      setRole(r.id);
                      setMenu(false);
                    }}
                  >
                    <Avatar src={r.avatar} name={r.name} size="sm" />
                    <span className="rm-meta">
                      <span className="rm-name">{r.name}</span>
                      <span className="rm-role">
                        {r.role} · {r.org}
                      </span>
                    </span>
                    {r.id === roleId && <Icon name="check" size={14} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Header>
  );
}

const Header = styled.header`
  position: absolute;
  top: 0;
  inset-inline: 0;
  height: 64px;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;

  .actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .bell-wrap {
    position: relative;
  }
  .bell-badge {
    position: absolute;
    top: 7px;
    inset-inline-end: 8px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--danger);
    border: 2px solid var(--bg);
  }
  .profile {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-inline-start: 6px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--fg);
  }
  .profile-meta {
    line-height: 1.25;
    text-align: start;
  }
  .profile-name {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .profile-role {
    display: block;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .role-wrap {
    position: relative;
  }
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 30;
  }
  .role-menu {
    position: absolute;
    z-index: 40;
    top: calc(100% + 8px);
    inset-inline-end: 0;
    width: 280px;
    padding: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-popover);
  }
  .rm-head {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
    padding: 6px 8px;
  }
  .rm-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px;
    border: none;
    background: transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    text-align: start;
    color: var(--fg);
  }
  .rm-item:hover {
    background: var(--surface-2);
  }
  .rm-item.on {
    background: var(--accent-soft);
  }
  .rm-meta {
    flex: 1;
    line-height: 1.3;
  }
  .rm-name {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .rm-role {
    display: block;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;
