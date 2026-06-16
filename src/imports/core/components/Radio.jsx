"use client";
import React from "react";
import styled from "styled-components";

export function Radio({
  checked = false,
  onChange,
  disabled = false,
  label,
  style = {},
  ...rest
}) {
  return (
    <Root $disabled={disabled} $checked={checked} style={style}>
      <span
        className="ring"
        onClick={() => !disabled && onChange && onChange(true)}
        {...rest}
      >
        {checked && <span className="dot" />}
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

  .ring {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    flex: none;
    border-radius: var(--radius-full);
    border: 1px solid ${(p) => (p.$checked ? "var(--accent)" : "var(--border)")};
    background: var(--field-bg);
    transition: border-color 120ms ease;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background: var(--accent);
  }
  .label {
    font-size: var(--text-sm);
    color: var(--fg);
  }
`;
