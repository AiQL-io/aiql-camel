"use client";
import React from "react";
import styled from "styled-components";
import { Icon } from "./Icon.jsx";

const VARIANTS = {
  ghost: {
    background: "transparent",
    color: "var(--fg-muted)",
    border: "1px solid transparent",
    hover: "var(--surface-2)",
  },
  secondary: {
    background: "var(--surface)",
    color: "var(--fg)",
    border: "1px solid var(--border)",
    hover: "var(--surface-2)",
  },
  soft: {
    background: "var(--accent-soft)",
    color: "var(--accent)",
    border: "1px solid transparent",
    hover: "var(--accent-soft)",
  },
};

export function IconButton({
  icon,
  name,
  variant = "ghost",
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
  style = {},
  ...rest
}) {
  const dim = { sm: 28, md: 34, lg: 40 }[size] || 34;
  const glyph = { sm: 16, md: 18, lg: 20 }[size] || 18;
  const v = VARIANTS[variant] || VARIANTS.ghost;

  return (
    <Root
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      $dim={dim}
      $v={v}
      $disabled={disabled}
      style={style}
      {...rest}
    >
      {icon || (name && <Icon name={name} size={glyph} />)}
    </Root>
  );
}

const Root = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(p) => p.$dim}px;
  height: ${(p) => p.$dim}px;
  border-radius: var(--radius-full);
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? "var(--disabled-opacity)" : 1)};
  transition: background 120ms ease;
  background: ${(p) => p.$v.background};
  color: ${(p) => p.$v.color};
  border: ${(p) => p.$v.border};

  &:hover {
    background: ${(p) => (p.$disabled ? p.$v.background : p.$v.hover)};
  }
`;
