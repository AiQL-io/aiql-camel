"use client";

import React, { useId } from "react";
import { BarChart, Bar, Tooltip } from "recharts";
import { tooltipStyle } from "@/imports/core/components/charts/chartTheme.js";
import { useContainerWidth } from "@/imports/core/components/charts/useChartSize.js";

export function Histogram({ bins, color = "var(--accent)", height = 60 }) {
  const id = useId().replace(/:/g, "");
  const [ref, width] = useContainerWidth();
  const data = bins.map((v, i) => ({ i, v }));

  return (
    <div ref={ref} style={{ width: "100%", height }}>
      {width > 0 && (
        <BarChart
          width={width}
          height={height}
          data={data}
          margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={`hist_${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.95} />
              <stop offset="100%" stopColor={color} stopOpacity={0.45} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            contentStyle={tooltipStyle}
            labelFormatter={() => ""}
            formatter={(v) => [v, "count"]}
          />
          <Bar
            dataKey="v"
            fill={`url(#hist_${id})`}
            radius={[4, 4, 2, 2]}
            isAnimationActive={true}
            animationDuration={850}
            animationEasing="ease-out"
          />
        </BarChart>
      )}
    </div>
  );
}
