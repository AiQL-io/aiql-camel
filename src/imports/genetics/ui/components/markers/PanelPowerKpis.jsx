"use client";

import React from "react";
import styled from "styled-components";
import { MetricTile } from "../MetricTile.jsx";

function fmtSci(v) {
  if (v === 0) return "0";
  if (v >= 0.001) return v.toFixed(4);
  const exp = Math.floor(Math.log10(v));
  const mant = v / Math.pow(10, exp);
  return `${mant.toFixed(1)}×10${sup(exp)}`;
}

function sup(n) {
  const map = {
    "-": "⁻",
    0: "⁰",
    1: "¹",
    2: "²",
    3: "³",
    4: "⁴",
    5: "⁵",
    6: "⁶",
    7: "⁷",
    8: "⁸",
    9: "⁹",
  };
  return String(n)
    .split("")
    .map((c) => map[c] || c)
    .join("");
}

export function PanelPowerKpis({ power }) {
  return (
    <Band>
      <MetricTile
        label="CPE (combined excl.)"
        value={`${(power.cpe * 100).toFixed(power.cpe > 0.9999 ? 4 : 2)}%`}
        methodKey="cpe"
      />
      <MetricTile label="PI" value={fmtSci(power.pi)} methodKey="pi" />
      <MetricTile label="PI-sibs" value={fmtSci(power.piSibs)} methodKey="pi" />
      <MetricTile
        label="Mean PIC"
        value={power.meanPic.toFixed(3)}
        methodKey="pic"
      />
      <MetricTile
        label="Loci / alleles"
        value={power.nLoci}
        unit={`/ ${power.nAlleles} alleles`}
      />
    </Band>
  );
}

const Band = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
`;
