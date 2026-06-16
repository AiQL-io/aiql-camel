"use client";
import React from "react";
import styled from "styled-components";

export function Icon({
  name,
  size = 16,
  color = "currentColor",
  weight = "regular",
  style = {},
  ...rest
}) {
  const weightClass = weight === "regular" ? "ph" : `ph-${weight}`;
  return (
    <Glyph
      className={`${weightClass} ph-${name}`}
      aria-hidden="true"
      $size={typeof size === "number" ? `${size}px` : size}
      $color={color}
      style={style}
      {...rest}
    />
  );
}

const Glyph = styled.i`
  font-size: ${(p) => p.$size};
  line-height: 1;
  color: ${(p) => p.$color};
  display: inline-flex;
  flex: none;
`;
