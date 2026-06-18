"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { exportCsv } from "@/imports/verify/ui/components/exporters.js";
import { useGeneticsState } from "@/imports/genetics/state/scopeStore.js";
import { SaveCohort } from "../SaveCohort.jsx";

export function BulkActionsBar({
  rows = [],
  access,
  estimator,
  label,
  onClear,
}) {
  const { saveCohortIds, setScopeCohort } = useGeneticsState();
  const [flagged, setFlagged] = useState(false);
  const ids = rows.map((r) => r.id);

  const addToReport = () => {
    exportCsv({
      filename: `manhal_inbreeding_report_${ids.length}.csv`,
      columns: [
        { label: "registration", get: (x) => x.reg },
        { label: "F", get: (x) => x.f },
        { label: "percentile", get: (x) => x.percentile },
        { label: "line", get: (x) => x.breed },
        { label: "region", get: (x) => x.region },
        { label: "owner", get: (x) => x.ownerName },
      ],
      rows,
      provenance: {
        title: `Inbreeding review report — ${label}`,
        subjects: `${rows.length} selected animals`,
        panel: access.panel,
        estimator,
      },
    });
  };

  const flag = () => {
    const id = saveCohortIds("Flagged for review", ids, "Inbreeding flag");
    setScopeCohort(id);
    setFlagged(true);
  };

  return (
    <BulkBar>
      <span className="n">{rows.length} selected</span>
      <SaveCohort
        ids={ids}
        origin="Inbreeding selection"
        defaultName="Inbreeding selection"
        size="sm"
        variant="secondary"
        label="Add to cohort"
      />
      <button type="button" onClick={addToReport}>
        <Icon name="file-plus" size={13} /> Add to report
      </button>
      <button type="button" onClick={flag} disabled={flagged}>
        <Icon name="flag" size={13} /> {flagged ? "Flagged" : "Flag for review"}
      </button>
      <button type="button" className="clear" onClick={onClear}>
        Clear
      </button>
    </BulkBar>
  );
}

const BulkBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--accent-soft);
  border: 1px solid var(--accent);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;

  .n {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--accent);
  }
  button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 28px;
    padding: 0 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface);
    color: var(--fg);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  button:disabled {
    opacity: var(--disabled-opacity);
    cursor: default;
  }
  .clear {
    margin-inline-start: auto;
    border: none;
    background: transparent;
    color: var(--fg-subtle);
  }
`;
