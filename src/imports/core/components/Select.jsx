"use client";
import React from "react";
import styled from "styled-components";
import { Icon } from "./Icon.jsx";

export function Select({
  size = "md",
  disabled = false,
  invalid = false,
  style = {},
  children,
  ...rest
}) {
  const h = { sm: 32, md: 38, lg: 44 }[size] || 38;
  return (
    <Root $h={h} $disabled={disabled} $invalid={invalid}>
      <select disabled={disabled} style={style} {...rest}>
        {children}
      </select>
      <span className="caret">
        <Icon name="caret-up-down" size={14} />
      </span>
    </Root>
  );
}

const Root = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  height: ${(p) => p.$h}px;
  border-radius: var(--radius-lg);
  background: ${(p) => (p.$disabled ? "var(--surface-2)" : "var(--field-bg)")};
  border: 1px solid ${(p) => (p.$invalid ? "var(--danger)" : "var(--border)")};
  box-shadow: var(--shadow-xs);
  opacity: ${(p) => (p.$disabled ? "var(--disabled-opacity)" : 1)};

  select {
    appearance: none;
    -webkit-appearance: none;
    border: none;
    outline: none;
    background: transparent;
    color: var(--fg);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    height: 100%;
    padding: 0 34px 0 12px;
    cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  }
  .caret {
    position: absolute;
    right: 10px;
    pointer-events: none;
    color: var(--fg-muted);
    display: inline-flex;
  }
`;
