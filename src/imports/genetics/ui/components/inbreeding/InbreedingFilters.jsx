"use client";

import React from "react";
import styled from "styled-components";
import { Select } from "@/imports/core/components/Select.jsx";

const EMPTY = { breed: "", region: "", ownerId: "", sex: "" };

export function InbreedingFilters({ facet, setFacet, facets }) {
  const active = facet.breed || facet.region || facet.ownerId || facet.sex;
  return (
    <Filters>
      <Select
        size="sm"
        value={facet.breed}
        onChange={(v) => setFacet((f) => ({ ...f, breed: v }))}
        options={[
          { value: "", label: "All lines" },
          ...facets.breeds.map((b) => ({ value: b, label: b })),
        ]}
      />
      <Select
        size="sm"
        value={facet.region}
        onChange={(v) => setFacet((f) => ({ ...f, region: v }))}
        options={[
          { value: "", label: "All regions" },
          ...facets.regions.map((b) => ({ value: b, label: b })),
        ]}
      />
      <Select
        size="sm"
        value={facet.ownerId}
        onChange={(v) => setFacet((f) => ({ ...f, ownerId: v }))}
        options={[
          { value: "", label: "All owners" },
          ...facets.owners.map((o) => ({ value: o.id, label: o.name })),
        ]}
      />
      <Select
        size="sm"
        value={facet.sex}
        onChange={(v) => setFacet((f) => ({ ...f, sex: v }))}
        options={[
          { value: "", label: "Both sexes" },
          ...facets.sexes.map((s) => ({ value: s, label: s })),
        ]}
      />
      {active && (
        <button type="button" className="clr" onClick={() => setFacet(EMPTY)}>
          Clear
        </button>
      )}
    </Filters>
  );
}

const Filters = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px 12px;

  .clr {
    border: none;
    background: transparent;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    cursor: pointer;
  }
`;
