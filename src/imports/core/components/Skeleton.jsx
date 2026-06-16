"use client";

import React from "react";
import styled from "styled-components";

export function Skeleton({ width = "100%", height = 12, radius, style = {} }) {
  return (
    <Root
      className="aiql-skeleton"
      aria-hidden="true"
      $w={typeof width === "number" ? `${width}px` : width}
      $h={typeof height === "number" ? `${height}px` : height}
      $radius={radius != null ? radius : undefined}
      style={style}
    />
  );
}

const Root = styled.span`
  display: block;
  width: ${(p) => p.$w};
  height: ${(p) => p.$h};
  border-radius: ${(p) => p.$radius ?? "initial"};
`;
