"use client";

import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import {
  useAdmin,
  setBuilding,
  logAudit,
} from "@/imports/admin/state/adminStore.js";

const TABS = [
  { key: "breeds", label: "Lines / Breeds" },
  { key: "regions", label: "Regions" },
  { key: "owners", label: "Owners / Stables" },
  { key: "statuses", label: "Statuses" },
];

export function ReferenceDataView({ access }) {
  const admin = useAdmin(access);
  const { can } = useRole();
  const isAdmin = can("manageAdmin");
  const [tab, setTab] = useState("breeds");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const animals = access.animals;
    const tally = (key) => {
      const m = new Map();
      for (const a of animals) m.set(a[key], (m.get(a[key]) || 0) + 1);
      return m;
    };
    const breed = tally("breed");
    const region = tally("region");
    const status = tally("status");
    const owner = new Map();
    for (const a of animals)
      owner.set(a.ownerId, (owner.get(a.ownerId) || 0) + 1);
    return { breed, region, status, owner };
  }, [access]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = [];
    if (tab === "breeds")
      list = access.facets.breeds.map((b) => ({
        name: b,
        count: counts.breed.get(b) || 0,
      }));
    else if (tab === "regions")
      list = access.facets.regions.map((r) => ({
        name: r,
        count: counts.region.get(r) || 0,
      }));
    else if (tab === "statuses")
      list = access.facets.statuses.map((s) => ({
        name: s,
        count: counts.status.get(s) || 0,
      }));
    else
      list = access.facets.owners.map((o) => ({
        name: o.name,
        sub: o.id,
        count: counts.owner.get(o.id) || 0,
      }));
    if (needle)
      list = list.filter((x) => x.name.toLowerCase().includes(needle));
    return list.sort((a, b) => b.count - a.count);
  }, [tab, q, access, counts]);

  const regenerate = () => {
    setBuilding(true);
    logAudit(null, {
      action: "Requested dataset regeneration",
      entityType: "reference",
    });
    setTimeout(() => setBuilding(false), 1600);
  };

  return (
    <>
      <TopBar>
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={tab === t.key ? "on" : ""}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {isAdmin && (
          <Button
            size="sm"
            variant="secondary"
            onClick={regenerate}
            disabled={admin.building}
            leadingIcon={
              <Icon
                name={admin.building ? "circle-notch" : "arrows-clockwise"}
                size={14}
              />
            }
          >
            {admin.building
              ? "Building national dataset…"
              : "Regenerate dataset"}
          </Button>
        )}
      </TopBar>

      <Card padding={0}>
        <Pad>
          <input
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <span className="n">{rows.length} entries</span>
        </Pad>
        <List>
          {rows.map((r) => (
            <div className="row" key={r.sub || r.name}>
              <span className="name">
                {r.name}
                {r.sub && <em>{r.sub}</em>}
              </span>
              <span className="bar">
                <span
                  className="fill"
                  style={{
                    width: `${Math.min(100, (r.count / (rows[0]?.count || 1)) * 100)}%`,
                  }}
                />
              </span>
              <span className="count">{r.count.toLocaleString()}</span>
            </div>
          ))}
          {rows.length === 0 && <div className="empty">No entries.</div>}
        </List>
      </Card>
      <Foot>
        Reference lists are derived from the synthetic registry. In production
        these are admin-managed lookups; here they are read-only with a seeded
        regenerate control.
      </Foot>
    </>
  );
}

const Foot = styled.p`
  margin-top: 12px;
  font-size: var(--text-xs);
  color: var(--fg-subtle);
  line-height: 1.5;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;

  .tabs {
    display: flex;
    gap: 6px;
  }
  .tabs button {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    padding: 6px 12px;
    border-radius: var(--radius-pill);
    cursor: pointer;
  }
  .tabs button.on {
    border-color: var(--accent);
    background: var(--accent-soft);
    color: var(--accent);
  }
`;

const Pad = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--separator);

  input {
    width: 260px;
    max-width: 50vw;
    padding: 7px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    color: var(--fg);
    font-size: var(--text-sm);
  }
  .n {
    margin-inline-start: auto;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-family: var(--font-mono);
  }
`;

const List = styled.div`
  max-height: 520px;
  overflow-y: auto;

  .row {
    display: grid;
    grid-template-columns: 1.4fr 2fr 80px;
    align-items: center;
    gap: 12px;
    padding: 9px 14px;
    border-bottom: 1px solid var(--separator);
  }
  .row:hover {
    background: var(--surface-2);
  }
  .name {
    display: flex;
    flex-direction: column;
    font-size: var(--text-sm);
  }
  .name em {
    font-style: normal;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-family: var(--font-mono);
  }
  .bar {
    height: 8px;
    background: var(--surface-2);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }
  .fill {
    display: block;
    height: 100%;
    background: var(--aiql-bar-gradient);
    transform-origin: left center;
    animation: aiql-grow-x 720ms cubic-bezier(0.2, 0.75, 0.25, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    .fill {
      animation: none;
    }
  }
  .count {
    text-align: end;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }
  .empty {
    padding: 28px;
    text-align: center;
    color: var(--fg-subtle);
    font-size: var(--text-sm);
  }
`;
