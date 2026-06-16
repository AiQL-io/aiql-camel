"use client";
import React from "react";
import styled from "styled-components";
import { Icon } from "./Icon.jsx";

export function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  label,
  style = {},
  ...rest
}) {
  const on = checked || indeterminate;
  return (
    <Root $disabled={disabled} $on={on} style={style}>
      <span
        className="box"
        onClick={() => !disabled && onChange && onChange(!checked)}
        {...rest}
      >
        {indeterminate ? (
          <Icon name="minus" size={12} weight="bold" />
        ) : checked ? (
          <Icon name="check" size={12} weight="bold" />
        ) : null}
      </span>
      {label && <span className="label">{label}</span>}
    </Root>
  );
}

const Root = styled.label`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? "var(--disabled-opacity)" : 1)};

  .box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    flex: none;
    border-radius: var(--radius-sm);
    border: 1px solid ${(p) => (p.$on ? "var(--accent)" : "var(--border)")};
    background: ${(p) => (p.$on ? "var(--accent)" : "var(--field-bg)")};
    color: var(--accent-fg);
    transition:
      background 120ms ease,
      border-color 120ms ease;
  }
  .label {
    font-size: var(--text-sm);
    color: var(--fg);
  }
`;
