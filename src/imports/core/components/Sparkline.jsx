"use client";

import React, { useId } from "react";
import styled from "styled-components";

export function Sparkline({
  data = [],
  width = 96,
  height = 32,
  color = "var(--accent)",
  fill = true,
}) {
  const id = useId().replace(/:/g, "");
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const pts = data.map((v, i) => [
    i * stepX,
    height - ((v - min) / span) * (height - 4) - 2,
  ]);
  const line = pts
    .map(
      (p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`,
    )
    .join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={`spark_${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.18" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#spark_${id})`} stroke="none" />
        </>
      )}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const Svg = styled.svg`
  display: block;
  overflow: visible;
`;
