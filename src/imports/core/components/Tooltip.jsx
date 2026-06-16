"use client";
import React, { useState } from "react";
import styled from "styled-components";

const POS = {
  top: "bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);",
  bottom: "top: calc(100% + 8px); left: 50%; transform: translateX(-50%);",
  left: "right: calc(100% + 8px); top: 50%; transform: translateY(-50%);",
  right: "left: calc(100% + 8px); top: 50%; transform: translateY(-50%);",
};

export function Tooltip({ label, side = "top", children, style = {} }) {
  const [open, setOpen] = useState(false);

  return (
    <Root
      $side={side}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span className="bubble" role="tooltip" style={style}>
          {label}
        </span>
      )}
    </Root>
  );
}

const Root = styled.span`
  position: relative;
  display: inline-flex;

  .bubble {
    position: absolute;
    z-index: 50;
    white-space: nowrap;
    padding: 6px 10px;
    border-radius: var(--radius-md);
    background: var(--foreground-overlay);
    color: var(--bg);
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    box-shadow: var(--shadow-md);
    pointer-events: none;
    ${(p) => POS[p.$side] || POS.top}
  }
`;
