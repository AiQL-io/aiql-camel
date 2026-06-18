"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { useAdmin, validatePanel } from "@/imports/admin/state/adminStore.js";

const TIER_LABEL = { C: "Core", E: "Extended", O: "Optional" };

export function MarkerPanelView({ access }) {
  const admin = useAdmin(access);
  const { can } = useRole();
  const isAdmin = can("manageAdmin");
  const panel = access.panel;
  const loci = panel.loci || [];
  const totalAlleles = loci.reduce((s, l) => s + (l.na || 0), 0);
  const meanPic = loci.length
    ? (loci.reduce((s, l) => s + (l.PIC || 0), 0) / loci.length).toFixed(3)
    : "—";
  const cpe = panel.cpeAll != null ? (panel.cpeAll * 100).toFixed(4) : "—";
  const pstate = admin.panel || {};

  return (
    <>
      <Card>
        <Overline>Active panel</Overline>
        <PanelHead>
          <div className="meta">
            <h2>{panel.name}</h2>
            <span className="ids">
              {panel.id} · v{panel.version} ·{" "}
              {panel.species || "Camelus dromedarius"}
            </span>
          </div>
          <div className="state">
            <span className={`badge ${pstate.validated ? "ok" : "warn"}`}>
              <Icon
                name={pstate.validated ? "seal-check" : "warning"}
                size={13}
              />
              {pstate.validated ? "Validated" : "Needs validation"}
            </span>
            {pstate.active && <span className="badge active">Active</span>}
          </div>
        </PanelHead>

        <Kpis>
          <Stat label="Loci" v={loci.length} />
          <Stat label="Total alleles" v={totalAlleles} />
          <Stat label="Mean PIC" v={meanPic} />
          <Stat label="CPE" v={`${cpe}%`} />
          <Stat
            label="Last validated"
            v={
              pstate.lastValidated
                ? new Date(pstate.lastValidated).toLocaleDateString()
                : "—"
            }
          />
        </Kpis>

        <Actions>
          {isAdmin ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => validatePanel(panel.id)}
              leadingIcon={<Icon name="check-square" size={14} />}
            >
              Re-validate panel
            </Button>
          ) : (
            <span className="ro">
              Panel management requires the Admin role.
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            as={Link}
            href="/genetics/markers"
            leadingIcon={<Icon name="chart-scatter" size={14} />}
          >
            Open Marker Analytics
          </Button>
        </Actions>
      </Card>

      <Card style={{ marginTop: 16 }} padding={0}>
        <Pad>
          <Overline>Loci ({loci.length})</Overline>
        </Pad>
        <Table>
          <div className="thead">
            <span>Locus</span>
            <span>Tier</span>
            <span>Allele range</span>
            <span>Na</span>
            <span>He</span>
            <span>PIC</span>
            <span>PE</span>
          </div>
          <div className="tbody">
            {loci.map((l) => (
              <div className="trow" key={l.locusName}>
                <span className="loc">{l.locusName}</span>
                <span className={`tier ${l.tier}`}>
                  {TIER_LABEL[l.tier] || l.tier}
                </span>
                <span className="mono">
                  {l.alleleRange ? l.alleleRange.join("–") : "—"}
                </span>
                <span className="mono">{l.na}</span>
                <span className="mono">{(l.He ?? 0).toFixed(3)}</span>
                <span className="mono">{(l.PIC ?? 0).toFixed(3)}</span>
                <span className="mono">{(l.PE ?? 0).toFixed(3)}</span>
              </div>
            ))}
          </div>
        </Table>
      </Card>
    </>
  );
}

function Stat({ label, v }) {
  return (
    <div className="stat">
      <span className="l">{label}</span>
      <b>{v}</b>
    </div>
  );
}

const PanelHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-top: 10px;

  .meta h2 {
    font-size: var(--text-lg);
    font-weight: var(--weight-medium);
  }
  .ids {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .state {
    display: flex;
    gap: 8px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs);
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
  }
  .badge.ok {
    color: var(--status-success);
    border-color: var(--status-success);
  }
  .badge.warn {
    color: var(--status-warning, #b8860b);
  }
  .badge.active {
    color: var(--accent);
    background: var(--accent-soft);
    border-color: transparent;
  }
`;

const Kpis = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;

  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
  }
  .stat .l {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .stat b {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;

  .ro {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;

const Pad = styled.div`
  padding: 14px 14px 0;
`;

const Table = styled.div`
  margin-top: 12px;
  .thead,
  .trow {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1.1fr 0.7fr 0.9fr 0.9fr 0.9fr;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
  }
  .thead {
    background: var(--bg-muted, var(--surface-2));
    border-bottom: 1px solid var(--border);
    border-top: 1px solid var(--border);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
    font-family: var(--font-mono);
  }
  .tbody {
    max-height: 460px;
    overflow-y: auto;
  }
  .trow {
    border-bottom: 1px solid var(--separator);
    font-size: var(--text-sm);
  }
  .trow:hover {
    background: var(--surface-2);
  }
  .loc {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .tier {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .tier.C {
    color: var(--status-success);
  }
  .tier.O {
    color: var(--fg-subtle);
  }
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
`;
