"use client";

import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Select } from "@/imports/core/components/Select.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { animalsForCohort } from "@/imports/genetics/state/scopeStore.js";

const EMPTY = {
  breed: "",
  region: "",
  ownerId: "",
  sex: "",
  status: "",
  ageMin: "",
  ageMax: "",
};

export function CohortBuilder({ access, edit, onCreate, onSave, onClose }) {
  const [filters, setFilters] = useState(() =>
    edit && edit.filters ? { ...EMPTY, ...edit.filters } : EMPTY,
  );
  const [name, setName] = useState(edit ? edit.name : "");
  const isEdit = Boolean(edit);

  const preview = useMemo(
    () => animalsForCohort(access, { filters }),
    [access, filters],
  );

  const autoName = useMemo(() => {
    const parts = [];
    if (filters.breed) parts.push(filters.breed);
    if (filters.region) parts.push(filters.region);
    if (filters.sex) parts.push(filters.sex);
    if (filters.status) parts.push(filters.status);
    if (filters.ageMin || filters.ageMax)
      parts.push(`age ${filters.ageMin || "0"}–${filters.ageMax || "∞"}`);
    if (filters.ownerId) {
      const o = access.facets.owners.find((x) => x.id === filters.ownerId);
      if (o) parts.push(o.name);
    }
    return parts.join(" · ") || "All animals";
  }, [filters, access]);

  const set = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }));
  const setNum = (k) => (e) =>
    setFilters((f) => ({ ...f, [k]: e.target.value }));

  const commit = () => {
    const finalName = name.trim() || autoName;
    if (isEdit) onSave(edit.id, { name: finalName, filters });
    else onCreate({ name: finalName, filters });
    onClose();
  };

  return (
    <Root>
      <div className="head">
        <b>{isEdit ? `Edit cohort — ${edit.name}` : "New cohort by facets"}</b>
        <button type="button" onClick={onClose} aria-label="Close">
          <Icon name="x" size={14} />
        </button>
      </div>
      {isEdit && edit.ids && (
        <p className="note">
          <Icon name="info" size={12} /> This is a selection-based cohort; only
          its name can be changed here.
        </p>
      )}
      {!(isEdit && edit.ids) && (
        <>
          <div className="grid">
            <label>
              Line
              <Select
                size="sm"
                value={filters.breed}
                onChange={set("breed")}
                options={[
                  { value: "", label: "Any line" },
                  ...access.facets.breeds.map((b) => ({ value: b, label: b })),
                ]}
              />
            </label>
            <label>
              Region
              <Select
                size="sm"
                value={filters.region}
                onChange={set("region")}
                options={[
                  { value: "", label: "Any region" },
                  ...access.facets.regions.map((b) => ({ value: b, label: b })),
                ]}
              />
            </label>
            <label>
              Owner
              <Select
                size="sm"
                value={filters.ownerId}
                onChange={set("ownerId")}
                options={[
                  { value: "", label: "Any owner" },
                  ...access.facets.owners.map((o) => ({
                    value: o.id,
                    label: o.name,
                  })),
                ]}
              />
            </label>
            <label>
              Sex
              <Select
                size="sm"
                value={filters.sex}
                onChange={set("sex")}
                options={[
                  { value: "", label: "Both" },
                  ...access.facets.sexes.map((s) => ({ value: s, label: s })),
                ]}
              />
            </label>
            <label>
              Status
              <Select
                size="sm"
                value={filters.status}
                onChange={set("status")}
                options={[
                  { value: "", label: "Any status" },
                  ...access.facets.statuses.map((s) => ({
                    value: s,
                    label: s,
                  })),
                ]}
              />
            </label>
            <label>
              Age min
              <input
                type="number"
                min="0"
                value={filters.ageMin}
                onChange={setNum("ageMin")}
                placeholder="any"
              />
            </label>
            <label>
              Age max
              <input
                type="number"
                min="0"
                value={filters.ageMax}
                onChange={setNum("ageMax")}
                placeholder="any"
              />
            </label>
          </div>
          <p className="note">
            Facets combine with AND. Build OR-style groups by saving each rule
            as its own cohort and comparing them.
          </p>
        </>
      )}
      <div className="row">
        <input
          className="namein"
          placeholder={autoName}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {!(isEdit && edit.ids) && (
          <span className="count">
            <b>{preview.length.toLocaleString()}</b> animals
          </span>
        )}
      </div>
      <div className="actions">
        <Button size="sm" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          variant="primary"
          disabled={!(isEdit && edit.ids) && preview.length === 0}
          onClick={commit}
          leadingIcon={<Icon name={isEdit ? "check" : "plus"} size={14} />}
        >
          {isEdit ? "Save changes" : "Create cohort"}
        </Button>
      </div>
    </Root>
  );
}

const Root = styled.div`
  border: 1px solid var(--accent);
  border-radius: var(--radius-lg);
  background: var(--surface);
  padding: 14px;

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .head b {
    font-size: var(--text-sm);
  }
  .head button {
    border: none;
    background: transparent;
    color: var(--fg-subtle);
    cursor: pointer;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 10px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  label input[type="number"] {
    padding: 7px 9px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    color: var(--fg);
    font-size: var(--text-sm);
  }
  .note {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
  }
  .namein {
    flex: 1;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    color: var(--fg);
    font-size: var(--text-sm);
  }
  .count {
    font-size: var(--text-sm);
    color: var(--fg-secondary);
    white-space: nowrap;
  }
  .count b {
    color: var(--fg);
    font-family: var(--font-mono);
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 14px;
  }
`;
