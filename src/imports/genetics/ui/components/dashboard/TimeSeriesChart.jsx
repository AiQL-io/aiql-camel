"use client";

import React, { useMemo } from "react";
import styled from "styled-components";
import { LineChart, Line, Tooltip } from "recharts";
import { tooltipStyle } from "@/imports/core/components/charts/chartTheme.js";
import { useContainerSize } from "@/imports/core/components/charts/useChartSize.js";

const SERIES = [
  { key: "ne", label: "Ne", color: "var(--accent)" },
  { key: "kinship", label: "Mean kinship", color: "var(--danger)" },
  { key: "he", label: "He", color: "var(--status-success)" },
];

export function TimeSeriesChart({ data }) {
  const [ref, width, measuredH] = useContainerSize();

  const series = useMemo(() => {
    if (!data || data.length < 2) return [];
    const ranges = {};
    for (const s of SERIES) {
      const vals = data.map((d) => d[s.key]);
      ranges[s.key] = { min: Math.min(...vals), max: Math.max(...vals) };
    }
    return data.map((d) => {
      const row = { label: d.label };
      for (const s of SERIES) {
        const { min, max } = ranges[s.key];
        row[s.key] = (d[s.key] - min) / (max - min || 1);
        row[`${s.key}_raw`] = d[s.key];
      }
      return row;
    });
  }, [data]);

  if (!data || data.length < 2)
    return <Empty>Not enough birth-cohort history in this scope.</Empty>;

  const plotH = Math.max(160, measuredH);

  return (
    <Root>
      <div className="legend">
        {SERIES.map((s) => (
          <span key={s.key}>
            <i style={{ background: s.color }} /> {s.label}
          </span>
        ))}
      </div>
      <div ref={ref} className="plot">
        {width > 0 && measuredH > 0 && (
          <LineChart
            width={width}
            height={plotH}
            data={series}
            margin={{ top: 6, right: 4, bottom: 4, left: 4 }}
          >
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              contentStyle={tooltipStyle}
              labelFormatter={(_, p) => p?.[0]?.payload?.label ?? ""}
              formatter={(v, name, item) => {
                const s = SERIES.find((x) => x.label === name);
                const raw = s ? item.payload[`${s.key}_raw`] : v;
                return [raw, name];
              }}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive
                animationDuration={650}
              />
            ))}
          </LineChart>
        )}
      </div>
      <div className="scale">
        <span>{data[0].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  .plot {
    width: 100%;
    flex: 1;
    min-height: 160px;
  }
  .legend {
    display: flex;
    gap: 14px;
    margin-bottom: 8px;
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .legend i {
    width: 10px;
    height: 3px;
    border-radius: 2px;
  }
  .scale {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--fg-subtle);
  }
`;

const Empty = styled.p`
  font-size: var(--text-sm);
  color: var(--fg-subtle);
`;
