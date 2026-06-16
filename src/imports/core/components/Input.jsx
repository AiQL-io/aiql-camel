"use client";
import React from "react";
import styled from "styled-components";

export function Input({
  size = "md",
  leading = null,
  trailing = null,
  invalid = false,
  disabled = false,
  style = {},
  wrapperStyle = {},
  ...rest
}) {
  const h = { sm: 32, md: 38, lg: 44 }[size] || 38;

  return (
    <Wrap $h={h} $invalid={invalid} $disabled={disabled} style={wrapperStyle}>
      {leading && <span className="affix">{leading}</span>}
      <input disabled={disabled} className="field" style={style} {...rest} />
      {trailing && <span className="affix">{trailing}</span>}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: ${(p) => p.$h}px;
  padding: 0 12px;
  border-radius: var(--radius-lg);
  background: ${(p) => (p.$disabled ? "var(--surface-2)" : "var(--field-bg)")};
  border: 1px solid ${(p) => (p.$invalid ? "var(--danger)" : "var(--border)")};
  box-shadow: var(--shadow-xs);
  opacity: ${(p) => (p.$disabled ? "var(--disabled-opacity)" : 1)};
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;

  ${(p) =>
    !p.$invalid &&
    `
    &:focus-within {
      border-color: var(--accent);
      box-shadow: 0 0 0 var(--ring-focus-width) var(--accent-soft);
    }
  `}

  .affix {
    display: inline-flex;
    color: var(--fg-muted);
    flex: none;
  }
  .field {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--field-foreground, var(--fg));
    font-family: var(--font-sans);
    font-size: var(--text-sm);
  }
`;
