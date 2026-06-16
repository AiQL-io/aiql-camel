"use client";
import React from "react";
import styled from "styled-components";

export function Card({
  as = "div",
  padding = 24,
  interactive = false,
  style = {},
  children,
  ...rest
}) {
  return (
    <Root
      as={as}
      $padding={typeof padding === "number" ? `${padding}px` : padding}
      $interactive={interactive}
      style={style}
      {...rest}
    >
      {children}
    </Root>
  );
}

const Root = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: ${(p) => p.$padding};
  cursor: ${(p) => (p.$interactive ? "pointer" : "default")};
  transition:
    box-shadow 140ms ease,
    border-color 140ms ease,
    transform 140ms ease;

  ${(p) =>
    p.$interactive &&
    `
    &:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--separator-2);
    }
  `}
`;
