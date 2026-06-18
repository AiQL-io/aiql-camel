"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { BarList } from "@/imports/core/components/BarList.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { Heatmap } from "../relatedness/Heatmap.jsx";
import * as pg from "@/imports/genetics/engine/popgen.js";

function counts(items) {
  const m = new Map();
  for (const x of items) m.set(x, (m.get(x) || 0) + 1);
  return [...m.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function ClusterDetail({ cluster, access }) {
  const members = useMemo(
    () => cluster.members.map((id) => access.getAnimal(id)).filter(Boolean),
    [cluster, access],
  );
  const matrix = useMemo(
    () => pg.relatednessMatrix(access, members, { order: "cluster", cap: 40 }),
    [access, members],
  );
  const byRegion = counts(members.map((a) => a.region));
  const byOwner = counts(members.map((a) => a.ownerName));
  const byLine = cluster.lineMix.map((x) => ({ label: x.breed, value: x.n }));

  return (
    <Card>
      <PanelHead>
        <Overline>
          Cluster {cluster.id + 1} · {cluster.size} animals · mean r{" "}
          {cluster.meanR.toFixed(2)} · mean F {cluster.meanF.toFixed(2)}
        </Overline>
      </PanelHead>

      <Insight>
        <Icon name="lightbulb" size={14} /> This cluster is concentrated in{" "}
        <b>{cluster.ownerConc.key}</b> ({cluster.ownerConc.pct}%) and the{" "}
        <b>{cluster.lineMix[0].breed}</b> line, with mean internal relatedness{" "}
        <b>{cluster.meanR.toFixed(2)}</b> — an over-related sub-population.
      </Insight>

      <Grid>
        <div>
          <Sub>Members</Sub>
          <div className="members">
            {members.map((a) => (
              <Link key={a.id} href={`/registry/${a.id}`} className="m">
                <span className="reg">{a.registrationId}</span>
                <span className="nm">{a.name}</span>
                <span className="f">F {a.inbreedingF.toFixed(2)}</span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <Sub>Internal relatedness</Sub>
          <Heatmap
            labels={matrix.labels}
            matrix={matrix.matrix}
            dendro={null}
            threshold={0}
            selected={null}
            onSelect={() => {}}
          />
        </div>
      </Grid>

      <Conc>
        <div>
          <Sub>By line</Sub>
          <BarList data={byLine} />
        </div>
        <div>
          <Sub>By region</Sub>
          <BarList data={byRegion} color="var(--status-warning)" />
        </div>
        <div>
          <Sub>By owner</Sub>
          <BarList data={byOwner} color="var(--danger)" />
        </div>
      </Conc>
    </Card>
  );
}

const PanelHead = styled.div`
  margin-bottom: 12px;
`;

const Insight = styled.p`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 12px;
  background: var(--accent-soft);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--fg-secondary);
  line-height: var(--leading-normal);
  margin-bottom: 16px;

  b {
    color: var(--fg);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 20px;

  .members {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 300px;
    overflow-y: auto;
  }
  .m {
    display: grid;
    grid-template-columns: 120px 1fr auto;
    gap: 8px;
    align-items: center;
    padding: 6px 8px;
    border: 1px solid var(--separator);
    border-radius: var(--radius-md);
  }
  .m:hover {
    background: var(--surface-2);
  }
  .reg {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .nm {
    font-size: var(--text-sm);
  }
  .f {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;

const Conc = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
`;

const Sub = styled.h4`
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--fg-subtle);
  margin-bottom: 10px;
`;
