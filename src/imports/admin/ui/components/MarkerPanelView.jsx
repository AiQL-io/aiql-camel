"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { DataTable } from "@/imports/core/components/DataTable.jsx";
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

  const columns = useMemo(
    () => [
      {
        id: "locus",
        header: "Locus",
        accessorKey: "locusName",
        cell: (c) => <span className="loc">{c.getValue()}</span>,
      },
      {
        id: "tier",
        header: "Tier",
        accessorKey: "tier",
        cell: (c) => (
          <span className={`tier ${c.getValue()}`}>
            {TIER_LABEL[c.getValue()] || c.getValue()}
          </span>
        ),
      },
      {
        id: "alleleRange",
        header: "Allele range",
        enableSorting: false,
        cell: (c) => {
          const l = c.row.original;
          return (
            <span className="mono">
              {l.alleleRange ? l.alleleRange.join("–") : "—"}
            </span>
          );
        },
      },
      {
        id: "na",
        header: "Na",
        accessorFn: (l) => l.na ?? 0,
        meta: { align: "end" },
        cell: (c) => <span className="mono">{c.row.original.na}</span>,
      },
      {
        id: "he",
        header: "He",
        accessorFn: (l) => l.He ?? 0,
        meta: { align: "end" },
        cell: (c) => (
          <span className="mono">{(c.row.original.He ?? 0).toFixed(3)}</span>
        ),
      },
      {
        id: "pic",
        header: "PIC",
        accessorFn: (l) => l.PIC ?? 0,
        meta: { align: "end" },
        cell: (c) => (
          <span className="mono">{(c.row.original.PIC ?? 0).toFixed(3)}</span>
        ),
      },
      {
        id: "pe",
        header: "PE",
        accessorFn: (l) => l.PE ?? 0,
        meta: { align: "end" },
        cell: (c) => (
          <span className="mono">{(c.row.original.PE ?? 0).toFixed(3)}</span>
        ),
      },
    ],
    [],
  );

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
        <CellStyles>
          <DataTable
            columns={columns}
            data={loci}
            maxHeight={460}
            emptyMessage="No loci in this panel."
          />
        </CellStyles>
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

const CellStyles = styled.div`
  margin-top: 12px;

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
