"use client";
import React from "react";
import styled from "styled-components";

const VARIANTS = {
  primary: {
    background: "var(--accent)",
    color: "var(--accent-fg)",
    border: "1px solid transparent",
    hover: "var(--accent-hover)",
  },
  secondary: {
    background: "var(--surface)",
    color: "var(--fg)",
    border: "1px solid var(--border)",
    hover: "var(--surface-2)",
  },
  ghost: {
    background: "transparent",
    color: "var(--fg)",
    border: "1px solid transparent",
    hover: "var(--surface-2)",
  },
  danger: {
    background: "var(--danger)",
    color: "var(--danger-fg)",
    border: "1px solid transparent",
    hover: "var(--danger-hover)",
  },
  soft: {
    background: "var(--accent-soft)",
    color: "var(--accent)",
    border: "1px solid transparent",
    hover: "var(--accent-soft)",
  },
};

const SIZES = {
  sm: { height: 32, font: "var(--text-sm)", w: 32, px: 12 },
  md: { height: 36, font: "var(--text-sm)", w: 36, px: 14 },
  lg: { height: 40, font: "var(--text-base)", w: 40, px: 16 },
};

export function Button({
  variant = "primary",
  size = "md",
  iconOnly = false,
  disabled = false,
  leadingIcon = null,
  trailingIcon = null,
  type = "button",
  style = {},
  children,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;

  return (
    <Root
      type={type}
      disabled={disabled}
      $s={s}
      $v={v}
      $iconOnly={iconOnly}
      $disabled={disabled}
      style={style}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </Root>
  );
}

const Root = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  height: ${(p) => p.$s.height}px;
  min-width: ${(p) => (p.$iconOnly ? p.$s.w : p.$s.height)}px;
  width: ${(p) => (p.$iconOnly ? `${p.$s.w}px` : "auto")};
  padding: ${(p) => (p.$iconOnly ? "0" : `0 ${p.$s.px}px`)};
  border-radius: var(--radius-full);
  font-family: var(--font-sans);
  font-size: ${(p) => p.$s.font};
  font-weight: var(--weight-medium);
  line-height: 1;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? "var(--disabled-opacity)" : 1)};
  transition:
    background 120ms ease,
    opacity 120ms ease;
  white-space: nowrap;
  background: ${(p) => p.$v.background};
  color: ${(p) => p.$v.color};
  border: ${(p) => p.$v.border};

  &:hover {
    background: ${(p) => (p.$disabled ? p.$v.background : p.$v.hover)};
  }
`;
