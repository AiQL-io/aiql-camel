"use client";
import React from "react";
import styled from "styled-components";
import { Icon } from "./Icon.jsx";

const TONES = {
  default: { color: "var(--fg-muted)", icon: "bell" },
  accent: { color: "var(--accent)", icon: "info" },
  success: { color: "var(--success)", icon: "check-circle" },
  warning: { color: "var(--warning)", icon: "warning" },
  danger: { color: "var(--danger)", icon: "x-circle" },
};

export function Toast({
  tone = "default",
  title,
  description,
  onDismiss,
  style = {},
}) {
  const t = TONES[tone] || TONES.default;

  return (
    <Root role="status" $toneColor={t.color} style={style}>
      <span className="icon">
        <Icon name={t.icon} size={18} weight="fill" />
      </span>
      <div className="body">
        <div className="title">{title}</div>
        {description && <div className="desc">{description}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="dismiss"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <Icon name="x" size={16} />
        </button>
      )}
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  width: 360px;
  max-width: 100%;
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);

  .icon {
    color: ${(p) => p.$toneColor};
    display: inline-flex;
    margin-top: 1px;
  }
  .body {
    flex: 1;
    min-width: 0;
  }
  .title {
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    color: var(--fg);
  }
  .desc {
    font-size: var(--text-sm);
    color: var(--fg-muted);
    margin-top: 2px;
  }
  .dismiss {
    border: none;
    background: transparent;
    color: var(--fg-muted);
    cursor: pointer;
    display: inline-flex;
    padding: 2px;
  }
`;
