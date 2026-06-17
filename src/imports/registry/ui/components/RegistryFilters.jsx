"use client";

import React from "react";
import styled from "styled-components";
import { Input } from "@/imports/core/components/Input.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function RegistryFilters({
  query,
  setQuery,
  filters,
  setFilter,
  facets,
  hasFilters,
  clear,
}) {
  return (
    <Bar>
      <div className="search">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, reg ID, microchip, owner…"
          leading={<Icon name="magnifying-glass" size={16} />}
        />
      </div>

      <Select
        size="sm"
        value={filters.breed}
        onChange={(v) => setFilter("breed", v)}
        options={[
          { value: "", label: "All breeds" },
          ...facets.breeds.map((b) => ({ value: b, label: b })),
        ]}
      />
      <Select
        size="sm"
        value={filters.region}
        onChange={(v) => setFilter("region", v)}
        options={[
          { value: "", label: "All regions" },
          ...facets.regions.map((r) => ({ value: r, label: r })),
        ]}
      />
      <Select
        size="sm"
        value={filters.owner}
        onChange={(v) => setFilter("owner", v)}
        options={[
          { value: "", label: "All owners" },
          ...facets.owners.map((o) => ({ value: o.id, label: o.name })),
        ]}
      />
      <Select
        size="sm"
        value={filters.sex}
        onChange={(v) => setFilter("sex", v)}
        options={[
          { value: "", label: "Any sex" },
          { value: "female", label: "Female" },
          { value: "male", label: "Male" },
        ]}
      />
      <Select
        size="sm"
        value={filters.status}
        onChange={(v) => setFilter("status", v)}
        options={[
          { value: "", label: "Any status" },
          ...facets.statuses.map((s) => ({
            value: s,
            label: s[0].toUpperCase() + s.slice(1),
          })),
        ]}
      />
      <Select
        size="sm"
        value={filters.dna}
        onChange={(v) => setFilter("dna", v)}
        options={[
          { value: "", label: "DNA: any" },
          { value: "yes", label: "DNA on file" },
          { value: "no", label: "No DNA" },
        ]}
      />
      <Select
        size="sm"
        value={filters.parentage}
        onChange={(v) => setFilter("parentage", v)}
        options={[
          { value: "", label: "Parentage: any" },
          { value: "verified", label: "Verified" },
          { value: "conflict", label: "Conflict" },
          { value: "unknown", label: "Unknown" },
        ]}
      />
      <Select
        size="sm"
        value={filters.alerts}
        onChange={(v) => setFilter("alerts", v)}
        options={[
          { value: "", label: "Alerts: any" },
          { value: "yes", label: "Has alert" },
          { value: "critical", label: "Critical alert" },
        ]}
      />

      {hasFilters && (
        <button type="button" className="clear" onClick={clear}>
          <Icon name="x" size={14} /> Clear
        </button>
      )}
    </Bar>
  );
}

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;

  .search {
    width: 280px;
  }
  .clear {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: transparent;
    color: var(--fg-muted);
    font-size: var(--text-sm);
    cursor: pointer;
  }
  .clear:hover {
    background: var(--surface-2);
    color: var(--fg);
  }
`;
