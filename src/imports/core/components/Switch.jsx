"use client";
import React from "react";
import styled from "styled-components";

export function Switch({
  checked = false,
  onChange,
  disabled = false,
  size = "md",
  style = {},
  ...rest
}) {
  const w = size === "sm" ? 32 : 40;
  const h = size === "sm" ? 18 : 22;
  const knob = h - 4;
  return (
    <Root
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      $w={w}
      $h={h}
      $knob={knob}
      $checked={checked}
      $disabled={disabled}
      style={style}
      {...rest}
    >
      <span className="knob" />
    </Root>
  );
}

const Root = styled.button`
  position: relative;
  width: ${(p) => p.$w}px;
  height: ${(p) => p.$h}px;
  flex: none;
  border-radius: var(--radius-full);
  border: none;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  background: ${(p) => (p.$checked ? "var(--accent)" : "var(--surface-3)")};
  opacity: ${(p) => (p.$disabled ? "var(--disabled-opacity)" : 1)};
  transition: background 140ms ease;

  .knob {
    position: absolute;
    top: 2px;
    left: ${(p) => (p.$checked ? p.$w - p.$knob - 2 : 2)}px;
    width: ${(p) => p.$knob}px;
    height: ${(p) => p.$knob}px;
    border-radius: var(--radius-full);
    background: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
    transition: left 140ms cubic-bezier(0.4, 0, 0.2, 1);
  }
`;
