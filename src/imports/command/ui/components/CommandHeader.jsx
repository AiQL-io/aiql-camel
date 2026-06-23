"use client";

import React from "react";
import styled from "styled-components";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { SegmentedControl } from "@/imports/core/components/SegmentedControl.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";

export function CommandHeader({ period, setPeriod, executive, setExecutive }) {
  const { t } = useI18n();
  return (
    <Header>
      <div>
        <Overline>{t("command.subtitle")}</Overline>
      </div>
      <div className="controls">
        <SegmentedControl
          value={period}
          onChange={setPeriod}
          options={[
            { value: "30", label: "30d" },
            { value: "90", label: "90d" },
            { value: "365", label: "365d" },
            { value: "all", label: "All" },
          ]}
        />
        <SegmentedControl
          value={executive ? "exec" : "analyst"}
          onChange={(v) => setExecutive(v === "exec")}
          options={[
            { value: "analyst", label: "Analyst" },
            { value: "exec", label: "Executive" },
          ]}
        />
      </div>
    </Header>
  );
}

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  .controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;
