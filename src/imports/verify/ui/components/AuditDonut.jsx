"use client";

import React from "react";
import { SEG } from "./auditConstants.js";

export function AuditDonut({ summary, total }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const denom = total || 1;
  const lens = SEG.map((s) => ((summary[s.key] || 0) / denom) * c);
  const segs = SEG.map((s, i) => ({
    key: s.key,
    color: s.color,
    len: lens[i],
    offset: lens.slice(0, i).reduce((sum, l) => sum + l, 0),
  }));
  return (
    <svg viewBox="0 0 130 130" width="130" height="130">
      <circle
        cx="65"
        cy="65"
        r={r}
        fill="none"
        stroke="var(--surface-2)"
        strokeWidth="14"
      />
      {segs.map((s) => (
        <circle
          key={s.key}
          cx="65"
          cy="65"
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="14"
          strokeDasharray={`${s.len} ${c - s.len}`}
          strokeDashoffset={-s.offset}
          transform="rotate(-90 65 65)"
        />
      ))}
      <text x="65" y="62" textAnchor="middle" className="dn">
        {total.toLocaleString()}
      </text>
      <text x="65" y="78" textAnchor="middle" className="dl">
        edges
      </text>
    </svg>
  );
}
