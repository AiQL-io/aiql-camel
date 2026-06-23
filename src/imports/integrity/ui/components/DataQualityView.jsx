"use client";

import React, { useId, useMemo, useState } from "react";
import styled from "styled-components";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card } from "@/imports/core/components/Card.jsx";
import { Gauge } from "@/imports/core/components/Gauge.jsx";
import { BarList } from "@/imports/core/components/BarList.jsx";
import { SegmentedControl } from "@/imports/core/components/SegmentedControl.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import {
  AXIS,
  BRAND,
  tooltipStyle,
} from "@/imports/core/components/charts/chartTheme.js";
import { useContainerWidth } from "@/imports/core/components/charts/useChartSize.js";
import { useAlerts } from "@/imports/integrity/state/alertStore.js";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function DataQualityView({ access }) {
  const q = useMemo(() => access.qualityMetrics(), [access]);
  const { alerts } = useAlerts(access);
  const [dim, setDim] = useState("region");
  const [burnRef, burnWidth] = useContainerWidth();
  const burnId = useId().replace(/:/g, "");

  const burn = useMemo(() => {
    const byMonth = new Map();
    for (const a of alerts) {
      const k = (a.detectedAt || "").slice(0, 7);
      if (!k) continue;
      const o = byMonth.get(k) || { detected: 0, resolved: 0 };
      o.detected += 1;
      if (a.status === "resolved" || a.status === "dismissed") o.resolved += 1;
      byMonth.set(k, o);
    }
    const keys = [...byMonth.keys()].sort();
    const nets = keys.map(
      (k) => byMonth.get(k).detected - byMonth.get(k).resolved,
    );
    return keys.map((k, i) => {
      const o = byMonth.get(k);
      const [y, m] = k.split("-");
      const open = nets.slice(0, i + 1).reduce((s, n) => s + n, 0);
      return {
        key: k,
        label: `${MONTHS[Number(m) - 1]} ’${y.slice(2)}`,
        detected: o.detected,
        open,
      };
    });
  }, [alerts]);

  const openAlerts = useMemo(
    () => alerts.filter((a) => a.status === "open"),
    [alerts],
  );
  const critOpen = openAlerts.filter((a) => a.severity === "critical").length;

  const rows =
    q[dim === "region" ? "byRegion" : dim === "breed" ? "byBreed" : "byOwner"];
  const barData = rows.slice(0, 12).map((r) => ({
    label: r.key,
    value: r.alerts,
    completeness: r.completeness,
  }));

  const tiles = [
    {
      label: "Profiled",
      value: q.pctProfiled,
      unit: "%",
      sub: `${q.profiled.toLocaleString()} / ${q.total.toLocaleString()} animals`,
    },
    {
      label: "Verified parentage",
      value: q.pctVerified,
      unit: "%",
      sub: `${q.verified.toLocaleString()} verified`,
    },
    {
      label: "Open alerts",
      value: openAlerts.length,
      sub: `${critOpen} critical`,
      tone: critOpen ? "danger" : "default",
    },
    {
      label: "Missing maternal",
      value: q.missingMat,
      sub: `${Math.round((q.missingMat / (q.total || 1)) * 100)}% — no dam on record`,
    },
    {
      label: "Missing paternal",
      value: q.missingPat,
      sub: `${Math.round((q.missingPat / (q.total || 1)) * 100)}% — no sire on record`,
    },
    {
      label: "Duplicate suspects",
      value: q.duplicates,
      sub: "near-identical profiles",
    },
    {
      label: "Incomplete profiles",
      value: q.incomplete,
      sub: "too few loci typed",
    },
  ];

  const alertLoad = Math.min((openAlerts.length / (q.total || 1)) * 100, 40);
  const confidence = Math.round(
    Math.max(0, q.pctProfiled * 0.4 + q.pctVerified * 0.6 - alertLoad * 0.5),
  );

  const burnHeight = 150;

  return (
    <>
      <Tiles>
        {tiles.map((t) => (
          <Card key={t.label}>
            <Overline>{t.label}</Overline>
            <div className="v">
              <b className={t.tone === "danger" ? "danger" : ""}>
                {t.value.toLocaleString()}
              </b>
              {t.unit && <span className="u">{t.unit}</span>}
            </div>
            <span className="sub">{t.sub}</span>
          </Card>
        ))}
      </Tiles>

      <TwoUp>
        <Card>
          <Overline>National registry confidence</Overline>
          <div className="conf">
            <Gauge
              value={confidence}
              max={100}
              color={
                confidence >= 70
                  ? "var(--status-success)"
                  : confidence >= 50
                    ? "var(--status-warning)"
                    : "var(--danger)"
              }
            />
            <div className="cmeta">
              <b>{confidence}/100</b>
              <span>
                Weighted from profiling ({q.pctProfiled}%), verified parentage (
                {q.pctVerified}%), and current alert load.
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="bhead">
            <Overline>Alert burn-down</Overline>
            <span className="cur">
              {openAlerts.length.toLocaleString()} open now
            </span>
          </div>
          {burn.length > 1 ? (
            <>
              <div
                ref={burnRef}
                style={{ width: "100%", height: burnHeight, marginTop: 8 }}
              >
                {burnWidth > 0 && (
                  <AreaChart
                    width={burnWidth}
                    height={burnHeight}
                    data={burn}
                    margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                  >
                    <defs>
                      <linearGradient
                        id={`burn_${burnId}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={BRAND.red}
                          stopOpacity={0.32}
                        />
                        <stop
                          offset="80%"
                          stopColor={BRAND.red}
                          stopOpacity={0.04}
                        />
                        <stop
                          offset="100%"
                          stopColor={BRAND.red}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={AXIS.stroke}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={{ stroke: AXIS.stroke }}
                      tick={{
                        fontSize: AXIS.fontSize,
                        fontFamily: AXIS.fontFamily,
                        fill: AXIS.tick,
                      }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={36}
                      tick={{
                        fontSize: AXIS.fontSize,
                        fontFamily: AXIS.fontFamily,
                        fill: AXIS.tick,
                      }}
                    />
                    <Tooltip
                      cursor={{ stroke: AXIS.stroke }}
                      contentStyle={tooltipStyle}
                      formatter={(v, name) => [
                        v,
                        name === "open" ? "open alerts" : "detected",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="open"
                      stroke={BRAND.red}
                      strokeWidth={2}
                      fill={`url(#burn_${burnId})`}
                      dot={false}
                      isAnimationActive
                      animationDuration={700}
                    />
                  </AreaChart>
                )}
              </div>
              <p className="bnote">
                Cumulative open alerts by detection month. As resolutions are
                logged, the curve burns down toward zero.
              </p>
            </>
          ) : (
            <p className="bnote">Not enough history to chart a trend.</p>
          )}
        </Card>
      </TwoUp>

      <RemediationCard>
        <RemediationHead>
          <Overline>Remediation targets</Overline>
          <SegmentedControl
            value={dim}
            onChange={setDim}
            options={[
              { value: "region", label: "Region" },
              { value: "owner", label: "Owner" },
              { value: "breed", label: "Breed" },
            ]}
          />
        </RemediationHead>
        <Hint>
          Ranked by alert burden. Completeness shows how much of each group is
          DNA-profiled — low completeness with high alerts is the priority.
        </Hint>
        <Break>
          <div className="bars">
            <BarList data={barData} color="var(--danger)" />
          </div>
          <div className="compl">
            <span className="ch">Completeness</span>
            {barData.map((r) => (
              <div className="crow" key={r.label}>
                <span className="cl">{r.label}</span>
                <span className="ctrack">
                  <CBar $pct={r.completeness} />
                </span>
                <span className="cv">{r.completeness}%</span>
              </div>
            ))}
          </div>
        </Break>
      </RemediationCard>
    </>
  );
}

const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;

  .v {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-top: 8px;
  }
  .v b {
    font-size: var(--text-2xl);
    font-weight: var(--weight-medium);
  }
  .v b.danger {
    color: var(--danger);
  }
  .v .u {
    font-size: var(--text-base);
    color: var(--fg-subtle);
  }
  .sub {
    display: block;
    margin-top: 4px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;

const TwoUp = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 16px;
  margin-top: 16px;

  .conf {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
  }
  .cmeta b {
    display: block;
    font-size: var(--text-xl);
    font-weight: var(--weight-medium);
  }
  .cmeta span {
    display: block;
    margin-top: 4px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    line-height: var(--leading-normal);
  }
  .bhead {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cur {
    font-size: var(--text-xs);
    color: var(--danger);
    font-family: var(--font-mono);
  }
  .bnote {
    margin-top: 10px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    line-height: var(--leading-normal);
  }
`;

const RemediationCard = styled(Card)`
  margin-top: 16px;
`;

const RemediationHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

const Hint = styled.p`
  font-size: var(--text-sm);
  color: var(--fg-subtle);
  line-height: var(--leading-normal);
  margin-top: 6px;
  margin-bottom: 18px;
`;

const CBar = styled.span`
  display: block;
  height: 100%;
  width: ${(p) => p.$pct}%;
  background: var(--aiql-bar-gradient);
  transform-origin: left center;
  animation: aiql-grow-x 720ms cubic-bezier(0.2, 0.75, 0.25, 1);
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Break = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 24px;
  margin-top: 14px;

  .bars {
    min-width: 0;
  }
  .ch {
    display: block;
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
    margin-bottom: 10px;
  }
  .crow {
    display: grid;
    grid-template-columns: 90px 1fr 40px;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .cl {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ctrack {
    height: 6px;
    border-radius: var(--radius-pill);
    background: var(--surface-2);
    overflow: hidden;
  }
  .cv {
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--fg-subtle);
    text-align: end;
  }
`;
