"use client";
import React from "react";
import styled from "styled-components";

export function Separator({
  orientation = "horizontal",
  inset = 0,
  style = {},
  ...rest
}) {
  const isV = orientation === "vertical";
  return (
    <Root
      role="separator"
      aria-orientation={orientation}
      $vertical={isV}
      $inset={inset}
      style={style}
      {...rest}
    />
  );
}

const Root = styled.div`
  flex: none;
  background: var(--separator);
  width: ${(p) => (p.$vertical ? "1px" : `calc(100% - ${p.$inset * 2}px)`)};
  height: ${(p) => (p.$vertical ? "100%" : "1px")};
  margin: ${(p) => (p.$vertical ? `0 ${p.$inset}px` : `${p.$inset}px 0`)};
`;
