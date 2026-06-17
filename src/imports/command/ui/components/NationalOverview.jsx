"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { BarList } from "@/imports/core/components/BarList.jsx";
import { Histogram } from "@/imports/core/components/Histogram.jsx";
import { Gauge } from "@/imports/core/components/Gauge.jsx";
import { SectionCard } from "./SectionCard.jsx";

export function NationalOverview({
  executive,
  regions = [],
  hetBins = [],
  inbrBins = [],
  richnessGauge = 0,
}) {
  return (
    <Row $executive={executive}>
      <SectionCard
        title="Geographic distribution"
        action={<Link href="/registry">Open registry →</Link>}
      >
        <BarList
          data={regions}
          renderHref={(d) => `/registry?region=${encodeURIComponent(d.label)}`}
        />
      </SectionCard>

      {!executive && (
        <SectionCard title="Diversity & inbreeding">
          <Stack>
            <div className="block">
              <Overline>Heterozygosity</Overline>
              <Histogram
                bins={hetBins}
                color="var(--status-success)"
                height={48}
              />
            </div>
            <div className="block">
              <Overline>Inbreeding distribution</Overline>
              <Histogram bins={inbrBins} color="var(--accent)" height={48} />
            </div>
            <div className="gauge">
              <Gauge
                value={richnessGauge}
                max={100}
                label="Allelic richness"
                color="var(--accent)"
              />
            </div>
          </Stack>
        </SectionCard>
      )}
    </Row>
  );
}

const Row = styled.div`
  display: grid;
  grid-template-columns: ${(p) => (p.$executive ? "1fr" : "1.4fr 1fr")};
  gap: 16px;
  margin-top: 16px;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;

  .block > :first-child {
    margin-bottom: 8px;
  }
  .gauge {
    display: flex;
    justify-content: center;
  }
`;
