"use client";

import React from "react";
import styled from "styled-components";
import { Logo } from "@/imports/core/components/Logo.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { IconButton } from "@/imports/core/components/IconButton.jsx";
import { Avatar } from "@/imports/core/components/Avatar.jsx";
import { useTheme } from "@/imports/core/providers/ThemeProvider.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";

function SearchPill({ placeholder }) {
  return (
    <Pill type="button">
      <Icon name="magnifying-glass" size={16} color="var(--fg-subtle)" />
      <span className="text">{placeholder}</span>
      <kbd>⌘K</kbd>
    </Pill>
  );
}

export function TopBar({ user }) {
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLocale } = useI18n();

  return (
    <Header>
      <Logo variant="full" size={36} productName={t("app.name")} />

      <div className="actions">
        <SearchPill placeholder={t("common.search")} />
        <span
          className="dataset"
          title={t("app.datasetIndicator", { count: "40,000" })}
        >
          <span className="dataset-dot" />
          {t("app.datasetIndicator", { count: "40,000" })}
        </span>
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
        <button type="button" className="profile">
          <Avatar src={user?.avatar} name={user?.name} size="sm" />
          <span className="profile-meta">
            <span className="profile-name">{user?.name}</span>
            <span className="profile-role">{user?.role}</span>
          </span>
          <Icon name="caret-down" size={14} color="var(--fg-subtle)" />
        </button>
      </div>
    </Header>
  );
}

const Pill = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 300px;
  height: 36px;
  padding: 0 8px 0 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  color: var(--fg-subtle);
  cursor: text;
  text-align: start;

  .text {
    flex: 1;
    font-size: var(--text-sm);
    color: var(--fg-subtle);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  kbd {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    background: var(--bg-muted);
    border: 1px solid var(--border);
    border-radius: var(--radius-xs);
    padding: 1px 6px;
  }
`;

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
  .dataset {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 10px;
    border-radius: var(--radius-pill);
    background: var(--bg-muted);
    border: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    white-space: nowrap;
  }
  .dataset-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--status-success);
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
`;
