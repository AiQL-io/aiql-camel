"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Histogram } from "@/imports/core/components/Histogram.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { FHistogram } from "./FHistogram.jsx";
import { FounderPanel } from "./FounderPanel.jsx";

export function InbreedingSidebar({
  fBins,
  pickedBin,
  setPickedBin,
  meanF,
  threshold,
  kinBins,
  founders,
}) {
  return (
    <>
      <Card>
        <Overline>Individual F distribution</Overline>
        <Hint>Click a bar to filter the table to that range.</Hint>
        <FHistogram
          bins={fBins}
          active={pickedBin}
          mean={meanF}
          threshold={threshold}
          onPick={(i) => setPickedBin((p) => (p === i ? null : i))}
        />
      </Card>
      <Card>
        <Overline>Kinship distribution</Overline>
        <Histogram bins={kinBins} height={100} />
        <Axis>
          <span>θ = 0</span>
          <span>0.3</span>
        </Axis>
      </Card>
      <Card>
        <Overline>Founders / over-representation</Overline>
        <FounderWrap>
          <FounderPanel founders={founders} />
        </FounderWrap>
      </Card>
    </>
  );
}

const Axis = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--fg-subtle);
`;

const FounderWrap = styled.div`
  margin-top: 12px;
`;

const Hint = styled.p`
  font-size: var(--text-xs);
  color: var(--fg-subtle);
  margin: 6px 0 10px;
`;
