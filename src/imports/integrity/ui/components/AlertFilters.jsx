"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { TYPE_LABEL } from "@/imports/integrity/state/alertStore.js";
import { SEVS } from "./alertConstants.js";

export function AlertFilters({ filters, setF, setFilters, facets }) {
  const [savedViews, setSavedViews] = useState([]);

  const onSave = () => {
    const name = prompt("Name this view");
    if (name) setSavedViews((v) => [...v, { name, filters: { ...filters } }]);
  };

  return (
    <Wrap>
      <Select
        size="sm"
        value={filters.type}
        onChange={(v) => setF("type", v)}
        options={[
          { value: "", label: "All types" },
          ...facets.types.map((t) => ({ value: t, label: TYPE_LABEL[t] })),
        ]}
      />
      <Select
        size="sm"
        value={filters.severity}
        onChange={(v) => setF("severity", v)}
        options={[
          { value: "", label: "Any severity" },
          ...SEVS.map((s) => ({ value: s, label: s })),
        ]}
      />
      <Select
        size="sm"
        value={filters.status}
        onChange={(v) => setF("status", v)}
        options={[
          { value: "", label: "Any status" },
          { value: "open", label: "Open" },
          { value: "in_review", label: "In review" },
          { value: "resolved", label: "Resolved" },
          { value: "dismissed", label: "Dismissed" },
        ]}
      />
      <Select
        size="sm"
        value={filters.region}
        onChange={(v) => setF("region", v)}
        options={[
          { value: "", label: "All regions" },
          ...facets.regions.map((r) => ({ value: r, label: r })),
        ]}
      />
      <Select
        size="sm"
        value={filters.assignee}
        onChange={(v) => setF("assignee", v)}
        options={[
          { value: "", label: "Any assignee" },
          ...facets.assignees.map((r) => ({ value: r, label: r })),
        ]}
      />
      <button type="button" className="save" onClick={onSave}>
        <Icon name="bookmark-simple" size={13} /> Save view
      </button>
      {savedViews.map((v, i) => (
        <button
          key={i}
          type="button"
          className="save"
          onClick={() => setFilters(v.filters)}
        >
          {v.name}
        </button>
      ))}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;

  .save {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
`;
