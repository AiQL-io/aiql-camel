"use client";

import React, { useId } from "react";
import { AreaChart, Area, YAxis } from "recharts";

export function Sparkline({
  data = [],
  width = 96,
  height = 44,
  color = "var(--accent)",
  fill = true,
}) {
  const id = useId().replace(/:/g, "");
  if (!data.length) return null;
  const series = data.map((v, i) => ({ i, v }));

  const nums = data.filter((v) => typeof v === "number" && Number.isFinite(v));
  const min = nums.length ? Math.min(...nums) : 0;
  const max = nums.length ? Math.max(...nums) : 1;
  const pad = (max - min) * 0.18 || Math.abs(max) * 0.1 || 1;
  const lo = min - pad;
  const hi = max + pad;

  return (
    <AreaChart
      width={width}
      height={height}
      data={series}
      margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
    >
      <defs>
        <linearGradient id={`spark_${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.5} />
          <stop offset="55%" stopColor={color} stopOpacity={0.14} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <YAxis hide domain={[lo, hi]} />
      <Area
        type="monotone"
        dataKey="v"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill ? `url(#spark_${id})` : "none"}
        baseValue={lo}
        dot={false}
        activeDot={false}
        isAnimationActive={true}
        animationDuration={900}
        animationEasing="ease-out"
      />
    </AreaChart>
  );
}
