"use client";
import React from "react";
import styled from "styled-components";

const TONES = {
  default: {
    base: "var(--fg-muted)",
    soft: "var(--surface-2)",
    solidBg: "var(--neutral)",
    solidFg: "var(--neutral-fg)",
  },
  accent: {
    base: "var(--accent)",
    soft: "var(--accent-soft)",
    solidBg: "var(--accent)",
    solidFg: "var(--accent-fg)",
  },
  success: {
    base: "var(--success)",
    soft: "var(--success-soft)",
    solidBg: "var(--success)",
    solidFg: "#0b3d22",
  },
  warning: {
    base: "var(--warning)",
    soft: "var(--warning-soft)",
    solidBg: "var(--warning)",
    solidFg: "#3d2a06",
  },
  danger: {
    base: "var(--danger)",
    soft: "var(--danger-soft)",
    solidBg: "var(--danger)",
    solidFg: "var(--danger-fg)",
  },
};

const SIZES = {
  sm: { h: 20, px: 8, fs: "var(--text-xs)", gap: 4 },
  md: { h: 24, px: 10, fs: "var(--text-xs)", gap: 6 },
  lg: { h: 28, px: 12, fs: "var(--text-sm)", gap: 6 },
};

function treatment(variant, t) {
  switch (variant) {
    case "solid":
      return {
        background: t.solidBg,
        color: t.solidFg,
        border: "1px solid transparent",
      };
    case "outline":
      return {
        background: "transparent",
        color: t.base,
        border: `1px solid ${t.base}`,
      };
    case "ghost":
      return {
        background: "transparent",
        color: t.base,
        border: "1px solid transparent",
      };
    case "soft":
    default:
      return {
        background: t.soft,
        color: t.base,
        border: "1px solid transparent",
      };
  }
}

export function Chip({
  tone = "default",
  variant = "soft",
  size = "md",
  leadingIcon = null,
  dot = false,
  style = {},
  children,
  ...rest
}) {
  const t = TONES[tone] || TONES.default;
  const s = SIZES[size] || SIZES.md;
  const v = treatment(variant, t);

  return (
    <Root $s={s} $v={v} $dotColor={t.base} style={style} {...rest}>
      {dot && <span className="dot" />}
      {leadingIcon}
      {children}
    </Root>
  );
}

const Root = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => p.$s.gap}px;
  height: ${(p) => p.$s.h}px;
  padding: 0 ${(p) => p.$s.px}px;
  border-radius: var(--radius-full);
  font-family: var(--font-sans);
  font-size: ${(p) => p.$s.fs};
  font-weight: var(--weight-medium);
  line-height: 1;
  white-space: nowrap;
  background: ${(p) => p.$v.background};
  color: ${(p) => p.$v.color};
  border: ${(p) => p.$v.border};

  .dot {
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    background: ${(p) => p.$dotColor};
    flex: none;
  }
`;
