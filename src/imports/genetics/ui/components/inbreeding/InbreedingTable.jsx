"use client";

import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { InbreedingFilters } from "./InbreedingFilters.jsx";
import { InbreedingDrawer } from "./InbreedingDrawer.jsx";
import { estimatorsFor, filterSortRows } from "./inbreedingHelpers.js";

export function InbreedingTable({
  rows,
  access,
  fRange,
  selected,
  setSelected,
}) {
  const [sort, setSort] = useState({ key: "f", dir: "desc" });
  const [openId, setOpenId] = useState(null);
  const [facet, setFacet] = useState({
    breed: "",
    region: "",
    ownerId: "",
    sex: "",
  });

  const facets = useMemo(() => {
    const u = (k) => [...new Set(rows.map((x) => x[k]))].sort();
    const owners = [
      ...new Map(rows.map((x) => [x.ownerId, x.ownerName])).entries(),
    ]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return {
      breeds: u("breed"),
      regions: u("region"),
      sexes: u("sex").filter(Boolean),
      owners,
    };
  }, [rows]);

  const filtered = useMemo(
    () => filterSortRows(rows, fRange, facet, sort),
    [rows, fRange, facet, sort],
  );

  const toggle = (id) =>
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const setSortKey = (key) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "f" ? "desc" : "asc" },
    );

  const meanHe =
    (access.panel.loci || []).reduce((s, l) => s + (l.He ?? 0), 0) /
    (access.panel.loci.length || 1);
  const animal = openId ? access.getAnimal(openId) : null;
  const est = animal ? estimatorsFor(animal, meanHe) : null;
  const relatives = animal
    ? access.animals
        .filter(
          (x) => x.ownerId === animal.ownerId && x.id !== animal.id && x.hasDNA,
        )
        .slice(0, 6)
    : [];

  const th = (k, label) => (
    <button type="button" className="th" onClick={() => setSortKey(k)}>
      {label}
      {sort.key === k && (
        <Icon name={sort.dir === "asc" ? "caret-up" : "caret-down"} size={10} />
      )}
    </button>
  );

  return (
    <>
      <InbreedingFilters facet={facet} setFacet={setFacet} facets={facets} />
      <Table>
        <div className="thead">
          <span className="ck" />
          {th("reg", "Animal")}
          {th("f", "F")}
          {th("breed", "Line")}
          {th("region", "Region")}
          {th("ownerName", "Owner")}
          {th("relatives", "Rel.")}
        </div>
        <div className="tbody">
          {filtered.map((r) => (
            <div className="trow" key={r.id}>
              <span className="ck" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={() => toggle(r.id)}
                />
              </span>
              <button
                type="button"
                className="reg"
                onClick={() => setOpenId(r.id)}
              >
                {r.reg}
              </button>
              <span className="fcell">
                <span className="ftrack">
                  <span
                    className="fbar"
                    style={{ width: `${(r.f / 0.5) * 100}%` }}
                  />
                </span>
                <b>{r.f.toFixed(3)}</b>
                <em>p{r.percentile}</em>
              </span>
              <span className="t">{r.breed}</span>
              <span className="t">{r.region}</span>
              <span className="t owner">{r.ownerName}</span>
              <span className="mono">{r.relatives}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty">No animals match this filter.</div>
          )}
        </div>
      </Table>

      <InbreedingDrawer
        animal={animal}
        est={est}
        relatives={relatives}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}

const Table = styled.div`
  .thead,
  .trow {
    display: grid;
    grid-template-columns: 30px 116px 1.3fr 92px 96px 110px 44px;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
  }
  .thead {
    background: var(--bg-muted);
    border-bottom: 1px solid var(--border);
  }
  .th {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    border: none;
    background: transparent;
    color: var(--fg-subtle);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
    padding: 0;
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
  .ck {
    display: flex;
    align-items: center;
  }
  .reg {
    border: none;
    background: transparent;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
    text-align: start;
    cursor: pointer;
    padding: 0;
  }
  .fcell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ftrack {
    width: 60px;
    height: 6px;
    border-radius: var(--radius-pill);
    background: var(--surface-2);
    overflow: hidden;
    flex: none;
  }
  .fbar {
    display: block;
    height: 100%;
    background: var(--danger);
  }
  .fcell b {
    font-family: var(--font-mono);
  }
  .fcell em {
    font-style: normal;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .t {
    color: var(--fg-secondary);
    font-size: var(--text-xs);
  }
  .t.owner {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .empty {
    padding: 24px;
    text-align: center;
    color: var(--fg-subtle);
    font-size: var(--text-sm);
  }
`;
