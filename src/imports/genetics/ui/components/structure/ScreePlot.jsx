"use client";

import React, { useMemo } from "react";
import styled from "styled-components";
import { BarChart, Bar, XAxis, LabelList, Tooltip } from "recharts";
import {
  AXIS,
  tooltipStyle,
} from "@/imports/core/components/charts/chartTheme.js";
import { useContainerWidth } from "@/imports/core/components/charts/useChartSize.js";

const HEIGHT = 140;

export function ScreePlot({ scree }) {
  const [ref, width] = useContainerWidth();
  const data = useMemo(
    () =>
      scree.map((s) => ({
        axis: s.axis,
        variance: s.variance,
        pct: Math.round(s.variance * 100),
      })),
    [scree],
  );

  return (
    <Root ref={ref} style={{ height: HEIGHT }}>
      {width > 0 && (
        <BarChart
          width={width}
          height={HEIGHT}
          data={data}
          margin={{ top: 16, right: 4, bottom: 4, left: 4 }}
        >
          <XAxis
            dataKey="axis"
            tickLine={false}
            axisLine={false}
            tick={{
              fill: AXIS.tick,
              fontSize: 11,
              fontFamily: AXIS.fontFamily,
            }}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            contentStyle={tooltipStyle}
            formatter={(v, _n, item) => [`${item.payload.pct}%`, "variance"]}
            labelFormatter={() => ""}
          />
          <Bar
            dataKey="variance"
            fill="var(--accent)"
            radius={[3, 3, 0, 0]}
            isAnimationActive
            animationDuration={650}
          >
            <LabelList
              dataKey="pct"
              position="top"
              formatter={(v) => `${v}%`}
              style={{
                fill: "var(--fg)",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
              }}
            />
          </Bar>
        </BarChart>
      )}
    </Root>
  );
}

const Root = styled.div`
  width: 100%;
`;
