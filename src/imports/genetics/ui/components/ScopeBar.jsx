"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Select } from "@/imports/core/components/Select.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { useGeneticsState } from "@/imports/genetics/state/scopeStore.js";

const MIX_COLORS = [
  "var(--accent)",
  "var(--chart-2, #6ea8fe)",
  "var(--chart-3, #f0a868)",
  "var(--chart-4, #8fd694)",
  "var(--chart-5, #c792ea)",
];

export function ScopeBar({ access }) {
  const router = useRouter();
  const {
    resolve,
    scope,
    cohorts,
    setScopeAll,
    setScopeFilters,
    setScopeCohort,
    saveCohort,
  } = useGeneticsState();
  const r = resolve(access);

  const mix = useMemo(() => {
    const animals = r.animals || [];
    const total = animals.length;
    if (!total) return [];
    const counts = new Map();
    animals.forEach((a) => {
      const b = a.breed || "Unknown";
      counts.set(b, (counts.get(b) || 0) + 1);
    });
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 4);
    const rest = sorted.slice(4).reduce((s, [, c]) => s + c, 0);
    const segs = top.map(([breed, c]) => ({
      breed,
      pct: Math.round((c / total) * 100),
    }));
    if (rest > 0) {
      segs.push({ breed: "Other", pct: Math.round((rest / total) * 100) });
    }
    return segs;
  }, [r.animals]);

  const compareScope = () => {
    let name = "Current scope";
    let filters = {};
    if (scope.kind === "filter") {
      filters = scope.filters;
      const parts = Object.entries(filters)
        .filter(([, v]) => v !== "" && v != null)
        .map(([, v]) => v);
      if (parts.length) name = parts.join(" · ");
    } else if (scope.kind === "cohort") {
      const coh = cohorts.find((c) => c.id === scope.cohortId);
      if (coh) {
        name = `${coh.name} (copy)`;
        filters = coh.filters || {};
      }
    }
    saveCohort(name, filters);
    router.push("/genetics/cohorts");
  };

  const setF = (k, v) => {
    const next = { ...(scope.kind === "filter" ? scope.filters : {}), [k]: v };

    const any = Object.values(next).some((x) => x !== "" && x != null);
    if (any) setScopeFilters(next);
    else setScopeAll();
  };

  const cohortValue = scope.kind === "cohort" ? scope.cohortId : "";
  const fv = (k) => (scope.kind === "filter" ? scope.filters[k] || "" : "");

  return (
    <Root>
      <div className="controls">
        <span className="lead">
          <Icon name="funnel" size={14} /> Scope
        </span>

        <Select
          size="sm"
          value={cohortValue}
          onChange={(v) => (v ? setScopeCohort(v) : setScopeAll())}
          options={[
            { value: "", label: "Whole population" },
            ...cohorts.map((c) => ({
              value: c.id,
              label: `Cohort · ${c.name}`,
            })),
          ]}
        />
        <Select
          size="sm"
          value={fv("breed")}
          onChange={(v) => setF("breed", v)}
          options={[
            { value: "", label: "All lines" },
            ...access.facets.breeds.map((b) => ({ value: b, label: b })),
          ]}
        />
        <Select
          size="sm"
          value={fv("region")}
          onChange={(v) => setF("region", v)}
          options={[
            { value: "", label: "All regions" },
            ...access.facets.regions.map((b) => ({ value: b, label: b })),
          ]}
        />
        <Select
          size="sm"
          value={fv("sex")}
          onChange={(v) => setF("sex", v)}
          options={[
            { value: "", label: "Both sexes" },
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ]}
        />
        {scope.kind !== "all" && (
          <button type="button" className="reset" onClick={setScopeAll}>
            <Icon name="x" size={12} /> Reset
          </button>
        )}
      </div>

      <div className="scopeInfo">
        <div className={`summary${r.tooSmall ? " warn" : ""}`}>
          {r.tooSmall && <Icon name="warning" size={13} />}
          <b>{r.n.toLocaleString()}</b>
          <span>of {access.total.toLocaleString()}</span>
          <span className="pct">{r.pctRegistry}%</span>
          {r.tooSmall && <span className="flag">small — low confidence</span>}
        </div>

        {mix.length > 0 && (
          <div className="mix" aria-label="Breed composition">
            {mix.map((seg, i) => (
              <span
                key={seg.breed}
                className="seg"
                style={{
                  width: `${seg.pct}%`,
                  background: MIX_COLORS[i % MIX_COLORS.length],
                }}
                title={`${seg.breed} ${seg.pct}%`}
              />
            ))}
          </div>
        )}

        <button type="button" className="compare" onClick={compareScope}>
          <Icon name="git-diff" size={12} /> Compare scope
        </button>
      </div>
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);

  .controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .lead {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
    margin-inline-end: 4px;
  }
  .reset {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 30px;
    padding: 0 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .scopeInfo {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .summary {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .mix {
    display: flex;
    width: 120px;
    height: 8px;
    border-radius: var(--radius-pill);
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--surface-2);
  }
  .mix .seg {
    height: 100%;
    min-width: 2px;
  }
  .compare {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding: 0 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .compare:hover {
    border-color: var(--separator-2);
    color: var(--fg);
  }
  .summary b {
    font-size: var(--text-base);
    color: var(--fg);
    font-family: var(--font-mono);
  }
  .summary .pct {
    color: var(--accent);
    font-family: var(--font-mono);
  }
  .summary.warn {
    color: var(--status-warning);
    align-items: center;
  }
  .summary .flag {
    color: var(--status-warning);
  }
`;
