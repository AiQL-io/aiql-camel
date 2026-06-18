"use client";

import React, { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import {
  exportCsv,
  download,
} from "@/imports/verify/ui/components/exporters.js";
import { useGeneticsState } from "@/imports/genetics/state/scopeStore.js";
import { InsightCard } from "./InsightCard.jsx";
import { ExportMenu } from "./ExportMenu.jsx";
import { ClusterNetwork } from "./clusters/ClusterNetwork.jsx";
import { ClusterList } from "./clusters/ClusterList.jsx";
import { ClusterDetail } from "./clusters/ClusterDetail.jsx";
import * as pg from "@/imports/genetics/engine/popgen.js";

const ALGOS = [
  { value: "louvain", label: "Louvain" },
  { value: "leiden", label: "Leiden" },
];
const RESOLUTIONS = [
  { value: "0.7", label: "Coarse (0.7)" },
  { value: "1", label: "Default (1.0)" },
  { value: "1.4", label: "Fine (1.4)" },
];
const NET_CLUSTERS = 16;

export function ClustersView({ access }) {
  const { resolve, saveCohortIds, setScopeCohort, audience } =
    useGeneticsState();
  const exec = audience === "executive";
  const router = useRouter();
  const r = resolve(access);

  const [threshold, setThreshold] = useState(0.25);
  const [algo, setAlgo] = useState("louvain");
  const [resolution, setResolution] = useState("1");
  const [selected, setSelected] = useState(null);
  const [computing, setComputing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const netRef = useRef(null);

  const flashCompute = () => {
    setComputing(true);
    setTimeout(() => setComputing(false), 420);
  };

  const model = useMemo(
    () =>
      pg.clusterModel(access, r.animals, {
        threshold,
        algo,
        resolution: Number(resolution),
      }),
    [access, r.animals, threshold, algo, resolution],
  );

  const { netNodes, netEdges } = useMemo(() => {
    const topIds = new Set(
      model.clusters.slice(0, NET_CLUSTERS).map((c) => c.id),
    );
    const idxMap = new Map();
    const nn = [];
    model.nodes.forEach((n, oldI) => {
      if (topIds.has(n.cluster)) {
        idxMap.set(oldI, nn.length);
        nn.push(n);
      }
    });
    const ne = model.edges
      .filter((e) => idxMap.has(e.a) && idxMap.has(e.b))
      .map((e) => ({ ...e, a: idxMap.get(e.a), b: idxMap.get(e.b) }));
    return { netNodes: nn, netEdges: ne };
  }, [model]);

  const selectedCluster =
    selected != null ? model.clusters.find((c) => c.id === selected) : null;

  const insight = useMemo(() => {
    const c = model.clusters[0];
    if (!c) return null;
    return {
      id: "cluster-top",
      severity: "high",
      title: `Largest over-related cluster: ${c.size} animals in ${c.ownerConc.key}, ${c.lineMix[0].breed} line`,
      detail: `Mean internal relatedness ${c.meanR.toFixed(2)}, mean F ${c.meanF.toFixed(2)} — a located inbreeding hotspot.`,
      href: null,
      cta: null,
    };
  }, [model]);

  const algoLabel = ALGOS.find((a) => a.value === algo).label;

  const exportMemberships = () => {
    const rows = [];
    for (const c of model.clusters)
      for (const id of c.members) {
        const a = access.getAnimal(id);
        if (a)
          rows.push({
            cluster: c.id + 1,
            reg: a.registrationId,
            line: a.breed,
            region: a.region,
            owner: a.ownerName,
            f: a.inbreedingF,
            meanR: c.meanR,
          });
      }
    exportCsv({
      filename: `manhal_clusters_r${threshold}.csv`,
      columns: [
        { label: "cluster", get: (x) => x.cluster },
        { label: "registration", get: (x) => x.reg },
        { label: "line", get: (x) => x.line },
        { label: "region", get: (x) => x.region },
        { label: "owner", get: (x) => x.owner },
        { label: "F", get: (x) => x.f },
        { label: "cluster_mean_r", get: (x) => x.meanR },
      ],
      rows,
      provenance: {
        title: `Over-related clusters (edge r ≥ ${threshold}) — ${r.label}`,
        subjects: `${model.clusters.length} clusters, ${rows.length} members`,
        panel: access.panel,
        estimator: algoLabel,
      },
    });
  };

  const exportClusterReport = () => {
    exportCsv({
      filename: `manhal_cluster_report_r${threshold}.csv`,
      columns: [
        { label: "cluster", get: (c) => c.id + 1 },
        { label: "size", get: (c) => c.size },
        { label: "mean_internal_r", get: (c) => c.meanR },
        { label: "mean_F", get: (c) => c.meanF },
        { label: "dominant_line", get: (c) => c.lineMix[0].breed },
        {
          label: "region_concentration",
          get: (c) => `${c.regionConc.key} (${c.regionConc.pct}%)`,
        },
        {
          label: "owner_concentration",
          get: (c) => `${c.ownerConc.key} (${c.ownerConc.pct}%)`,
        },
      ],
      rows: model.clusters,
      provenance: {
        title: `Per-cluster summary report (${algoLabel}) — ${r.label}`,
        subjects: `${model.clusters.length} clusters`,
        panel: access.panel,
        estimator: `${algoLabel} · resolution ${resolution}`,
      },
    });
  };

  const exportNewick = () => {
    const safe = (s) => String(s).replace(/[(),:;\s]/g, "_");
    const clades = model.clusters.map((c) => {
      const leaves = c.members
        .map((id) => {
          const a = access.getAnimal(id);
          return `${safe(a ? a.registrationId : id)}:${(1 - c.meanR).toFixed(3)}`;
        })
        .join(",");
      const bl = (0.5 - c.meanR / 2).toFixed(3);
      return `(${leaves})C${c.id + 1}:${bl}`;
    });
    const newick = `(${clades.join(",")})root;`;
    download(
      `# Manhal cluster dendrogram (Newick) — ${algoLabel}, edge r ≥ ${threshold}\n${newick}`,
      `manhal_clusters_r${threshold}.nwk`,
      "text/plain",
    );
  };

  const viewMembers = (clusterId) => {
    const c = model.clusters.find((x) => x.id === clusterId);
    if (!c) return;
    const id = saveCohortIds(
      `Cluster ${clusterId + 1}`,
      c.members,
      "Cluster detection",
    );
    setScopeCohort(id);
    setSelected(clusterId);
  };

  return (
    <>
      <Toolbar>
        <div className="grp">
          <span className="lab">Edge threshold r ≥ {threshold.toFixed(2)}</span>
          <input
            type="range"
            min="0.15"
            max="0.5"
            step="0.05"
            value={threshold}
            onChange={(e) => {
              setThreshold(Number(e.target.value));
              flashCompute();
            }}
          />
          <span className="lab">Algorithm</span>
          <Select
            size="sm"
            value={algo}
            onChange={(v) => {
              setAlgo(v);
              flashCompute();
            }}
            options={ALGOS}
          />
          <span className="lab">Resolution</span>
          <Select
            size="sm"
            value={resolution}
            onChange={(v) => {
              setResolution(v);
              flashCompute();
            }}
            options={RESOLUTIONS}
          />
        </div>
        <ExportMenu
          figureRef={netRef}
          figureName="manhal_cluster_network"
          items={[
            {
              label: "Memberships (CSV)",
              icon: "table",
              onClick: exportMemberships,
            },
            {
              label: "Per-cluster report (CSV)",
              icon: "file-text",
              onClick: exportClusterReport,
            },
            {
              label: "Dendrogram (Newick)",
              icon: "tree-structure",
              onClick: exportNewick,
            },
          ]}
        />
      </Toolbar>

      {model.clusters.length === 0 ? (
        <Card>
          <p
            style={{
              padding: 24,
              textAlign: "center",
              color: "var(--fg-subtle)",
              fontSize: "var(--text-sm)",
            }}
          >
            No clusters above r ≥ {threshold.toFixed(2)} in this scope. Try
            lowering the edge threshold.
          </p>
        </Card>
      ) : (
        <>
          {insight && (
            <div style={{ marginBottom: 16 }}>
              <InsightCard insight={insight} />
            </div>
          )}
          <Note>
            <Icon name="info" size={13} /> {model.clusters.length} clusters
            detected over a seeded sample of {model.n} of{" "}
            {model.poolSize.toLocaleString()} animals (sparse high-relatedness
            graph). Network shows the{" "}
            {Math.min(NET_CLUSTERS, model.clusters.length)} largest.
          </Note>

          <Grid>
            <Card>
              <PanelHead>
                <Overline>Cluster network</Overline>
                {selected != null && (
                  <button
                    type="button"
                    className="clr"
                    onClick={() => setSelected(null)}
                  >
                    Clear focus
                  </button>
                )}
              </PanelHead>
              <div ref={netRef} style={{ position: "relative" }}>
                <ClusterNetwork
                  nodes={netNodes}
                  edges={netEdges}
                  selected={selected}
                  onSelectCluster={setSelected}
                  onNode={(id) => router.push(`/registry/${id}`)}
                  onEdge={(a, b) =>
                    router.push(`/verify/relationship?a=${a}&b=${b}`)
                  }
                />
                {computing && (
                  <Computing>
                    <span className="spin" />
                    Computing…
                  </Computing>
                )}
              </div>
            </Card>
            {exec && !showDetail ? null : (
              <FillCard>
                <PanelHead>
                  <Overline>Ranked clusters</Overline>
                </PanelHead>
                <ClusterList
                  clusters={model.clusters}
                  selected={selected}
                  onSelect={setSelected}
                  onViewMembers={viewMembers}
                />
              </FillCard>
            )}
          </Grid>

          {exec && !showDetail ? (
            <ExecBar>
              <span>Executive view — simplified.</span>
              <button type="button" onClick={() => setShowDetail(true)}>
                Show analyst detail
              </button>
            </ExecBar>
          ) : (
            <div style={{ marginTop: 16 }}>
              {selectedCluster ? (
                <ClusterDetail cluster={selectedCluster} access={access} />
              ) : (
                <Card>
                  <p
                    style={{
                      padding: 24,
                      textAlign: "center",
                      color: "var(--fg-subtle)",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    Select a cluster from the network or list to see its
                    members, internal relatedness, and concentration.
                  </p>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;

  .grp {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .lab {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  input[type="range"] {
    accent-color: var(--accent);
  }
`;

const Note = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  font-size: var(--text-xs);
  color: var(--fg-subtle);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;

  .clr {
    border: none;
    background: transparent;
    color: var(--accent);
    font-size: var(--text-xs);
    cursor: pointer;
  }
`;

const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const FillCard = styled(Card)`
  display: flex;
  flex-direction: column;

  > :last-child {
    flex: 1;
    min-height: 0;
  }
`;

const ExecBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--fg-subtle);

  button {
    border: none;
    background: transparent;
    color: var(--accent);
    font-size: var(--text-sm);
    cursor: pointer;
    padding: 0;
  }
`;

const Computing = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: color-mix(in srgb, var(--surface) 70%, transparent);
  font-size: var(--text-sm);
  color: var(--fg-subtle);
  z-index: 3;

  .spin {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
