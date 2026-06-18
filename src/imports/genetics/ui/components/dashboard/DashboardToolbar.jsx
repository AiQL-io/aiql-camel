"use client";

import React from "react";
import styled from "styled-components";
import { Select } from "@/imports/core/components/Select.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { PERIODS } from "./dashboardHelpers.js";

export function DashboardToolbar({ period, setPeriod, onExport }) {
  return (
    <Toolbar>
      <div className="left">
        <span className="pl">Period</span>
        <Select
          size="sm"
          value={period}
          onChange={setPeriod}
          options={PERIODS}
        />
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={onExport}
        leadingIcon={<Icon name="download-simple" size={14} />}
      >
        Export
      </Button>
    </Toolbar>
  );
}

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;

  .left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pl {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
`;
