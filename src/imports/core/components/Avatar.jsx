"use client";
import React from "react";
import styled from "styled-components";

export function Avatar({
  src,
  initials,
  name,
  size = "md",
  ring = false,
  style = {},
  ...rest
}) {
  const dim = { xs: 24, sm: 28, md: 36, lg: 44 }[size] || 36;
  const fontSize = { xs: 10, sm: 11, md: 13, lg: 16 }[size] || 13;
  const label =
    initials ||
    (name
      ? name
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
      : "");

  return (
    <Root
      title={name}
      $dim={dim}
      $fontSize={fontSize}
      $ring={ring}
      style={style}
      {...rest}
    >
      {src ? <img src={src} alt={name || ""} /> : label}
    </Root>
  );
}

const Root = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(p) => p.$dim}px;
  height: ${(p) => p.$dim}px;
  border-radius: var(--radius-full);
  overflow: hidden;
  flex: none;
  background: var(--surface-2);
  color: var(--fg-muted);
  font-family: var(--font-mono);
  font-size: ${(p) => p.$fontSize}px;
  font-weight: var(--weight-medium);
  text-transform: uppercase;
  letter-spacing: -0.02em;
  box-shadow: ${(p) =>
    p.$ring ? "0 0 0 2px var(--surface), 0 0 0 3px var(--border)" : "none"};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
