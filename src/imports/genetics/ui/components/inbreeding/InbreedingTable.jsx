"use client";

import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { DataTable } from "@/imports/core/components/DataTable.jsx";
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
    () => filterSortRows(rows, fRange, facet, { key: "f", dir: "desc" }),
    [rows, fRange, facet],
  );

  const toggle = (id) =>
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

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

  const columns = useMemo(
    () => [
      {
        id: "ck",
        header: "",
        enableSorting: false,
        cell: (c) => {
          const r = c.row.original;
          return (
            <span className="ck" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selected.has(r.id)}
                onChange={() => toggle(r.id)}
              />
            </span>
          );
        },
      },
      {
        id: "reg",
        header: "Animal",
        accessorKey: "reg",
        cell: (c) => (
          <button
            type="button"
            className="reg"
            onClick={() => setOpenId(c.row.original.id)}
          >
            {c.getValue()}
          </button>
        ),
      },
      {
        id: "f",
        header: "F",
        accessorFn: (r) => r.f,
        cell: (c) => {
          const r = c.row.original;
          return (
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
          );
        },
      },
      {
        id: "breed",
        header: "Line",
        accessorKey: "breed",
        cell: (c) => <span className="t">{c.getValue()}</span>,
      },
      {
        id: "region",
        header: "Region",
        accessorKey: "region",
        cell: (c) => <span className="t">{c.getValue()}</span>,
      },
      {
        id: "ownerName",
        header: "Owner",
        accessorKey: "ownerName",
        cell: (c) => <span className="t owner">{c.getValue()}</span>,
      },
      {
        id: "relatives",
        header: "Rel.",
        accessorFn: (r) => r.relatives,
        meta: { align: "end" },
        cell: (c) => <span className="mono">{c.row.original.relatives}</span>,
      },
    ],
    [selected],
  );

  return (
    <>
      <InbreedingFilters facet={facet} setFacet={setFacet} facets={facets} />
      <CellStyles>
        <DataTable
          columns={columns}
          data={filtered}
          maxHeight={460}
          emptyMessage="No animals match this filter."
        />
      </CellStyles>

      <InbreedingDrawer
        animal={animal}
        est={est}
        relatives={relatives}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}

const CellStyles = styled.div`
  .ck {
    display: inline-flex;
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
    display: inline-flex;
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
    background: var(--aiql-bar-gradient);
    transform-origin: left center;
    animation: aiql-grow-x 720ms cubic-bezier(0.2, 0.75, 0.25, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    .fbar {
      animation: none;
    }
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
    display: inline-block;
    max-width: 110px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
  }
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;
