"use client";

import React from "react";
import styled from "styled-components";
import { Select } from "@/imports/core/components/Select.jsx";
import { F_ESTIMATORS } from "./inbreedingHelpers.js";

export function InbreedingToolbar({
  estimator,
  setEstimator,
  threshold,
  setThreshold,
  exportSlot,
}) {
  return (
    <Toolbar>
      <div className="grp">
        <span className="lab">F estimator</span>
        <Select
          size="sm"
          value={estimator}
          onChange={setEstimator}
          options={F_ESTIMATORS}
        />
        <span className="lab">Threshold F ≥ {threshold.toFixed(2)}</span>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
        />
      </div>
      {exportSlot}
    </Toolbar>
  );
}

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;

  .grp {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .lab {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  input[type="range"] {
    accent-color: var(--accent);
  }
`;
