"use client";

import React from "react";
import styled from "styled-components";
import { MetricTile } from "../MetricTile.jsx";

export function DashboardKpis({ div, time }) {
  const neCi = Math.max(1, Math.round(div.ne * 0.15));
  const s = (key) => time.map((t) => t[key]);
  return (
    <KpiBand>
      <MetricTile
        label="Genetic Diversity Index"
        value={div.gdi}
        band={div.gdiBand}
        methodKey="gdi"
        spark={s("gdi")}
      />
      <MetricTile
        label="Mean He"
        value={div.meanHe}
        loci={div.informativeLoci}
        methodKey="he"
        href="/genetics/markers"
        spark={s("he")}
      />
      <MetricTile
        label="Mean Ho"
        value={div.meanHo}
        loci={div.informativeLoci}
        methodKey="ho"
        href="/genetics/markers"
        spark={s("ho")}
      />
      <MetricTile
        label="Allelic richness"
        value={div.ar}
        unit="alleles"
        methodKey="ar"
        href="/genetics/markers"
        spark={s("ar")}
      />
      <MetricTile
        label="Ne (effective pop.)"
        value={div.ne}
        ci={neCi}
        methodKey="ne"
        href="/genetics/inbreeding"
        spark={s("ne")}
      />
      <MetricTile
        label="Mean inbreeding F"
        value={div.meanF}
        methodKey="f"
        href="/genetics/inbreeding"
        spark={s("meanF")}
      />
      <MetricTile
        label="N analysed"
        value={div.nAnalyzed.toLocaleString()}
        delta={`${div.pctRegistry}% of registry`}
        spark={s("n")}
      />
    </KpiBand>
  );
}

const KpiBand = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
`;
