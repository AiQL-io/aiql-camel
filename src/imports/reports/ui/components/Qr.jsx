"use client";

import React from "react";
import { qrMatrix } from "@/imports/reports/engine/reports.js";

export function Qr({ code, size = 96, fg = "var(--fg)", bg = "transparent" }) {
  const n = 21;
  const grid = qrMatrix(code, n);
  const cell = size / n;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Verification QR for ${code}`}
    >
      <rect width={size} height={size} fill={bg} />
      {grid.flatMap((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell + 0.4}
              height={cell + 0.4}
              fill={fg}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
