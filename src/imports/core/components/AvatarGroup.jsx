"use client";
import React from "react";
import styled from "styled-components";
import { Avatar } from "./Avatar.jsx";

export function AvatarGroup({
  people = [],
  max = 4,
  size = "xs",
  style = {},
  ...rest
}) {
  const dim = { xs: 24, sm: 28, md: 36 }[size] || 24;
  const fontSize = { xs: 10, sm: 11, md: 13 }[size] || 10;
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;

  return (
    <Root $dim={dim} $fontSize={fontSize} style={style} {...rest}>
      {shown.map((p, i) => (
        <span key={i} className="item" style={{ zIndex: i }}>
          <Avatar {...p} size={size} ring />
        </span>
      ))}
      {overflow > 0 && (
        <span className="overflow" style={{ zIndex: shown.length }}>
          +{overflow}
        </span>
      )}
    </Root>
  );
}

const Root = styled.div`
  display: inline-flex;
  align-items: center;

  .item {
    position: relative;
  }
  .item + .item {
    margin-left: -8px;
  }
  .overflow {
    margin-left: -8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${(p) => p.$dim}px;
    height: ${(p) => p.$dim}px;
    border-radius: var(--radius-full);
    background: var(--surface-2);
    color: var(--fg-muted);
    font-family: var(--font-mono);
    font-size: ${(p) => p.$fontSize}px;
    font-weight: var(--weight-medium);
    box-shadow:
      0 0 0 2px var(--surface),
      0 0 0 3px var(--border);
  }
`;
