"use client";

import React from "react";
import styled from "styled-components";

export function Overline({
  children,
  color = "var(--fg-subtle)",
  style = {},
  ...rest
}) {
  return (
    <Root $color={color} style={style} {...rest}>
      {children}
    </Root>
  );
}

const Root = styled.div`
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  line-height: 16px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${(p) => p.$color};
`;
