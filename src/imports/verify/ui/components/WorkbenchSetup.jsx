"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { SegmentedControl } from "@/imports/core/components/SegmentedControl.jsx";
import { SubjectPicker } from "./SubjectPicker.jsx";

export function WorkbenchSetup({ access, wb }) {
  return (
    <Card>
      <Overline style={{ marginBottom: 14 }}>Subjects</Overline>
      <Subjects>
        <SubjectPicker
          access={access}
          value={wb.offspringId}
          onChange={wb.setOffspringId}
          label="Offspring"
          role="offspring"
        />
        <div className="mode">
          <span className="lbl">Mode</span>
          <SegmentedControl
            value={wb.mode}
            onChange={wb.setMode}
            options={[
              { value: "paternity", label: "Paternity" },
              { value: "maternity", label: "Maternity" },
              { value: "trio", label: "Trio" },
            ]}
          />
        </div>
      </Subjects>
      <Candidates>
        {(wb.mode === "paternity" || wb.mode === "trio") && (
          <SubjectPicker
            access={access}
            value={wb.sireId}
            onChange={wb.setSireId}
            label="Candidate sire"
            role="sire"
            offspring={wb.offspring}
          />
        )}
        {(wb.mode === "maternity" || wb.mode === "trio") && (
          <SubjectPicker
            access={access}
            value={wb.damId}
            onChange={wb.setDamId}
            label="Candidate dam"
            role="dam"
            offspring={wb.offspring}
          />
        )}
      </Candidates>
      <Button
        variant="primary"
        disabled={!wb.canRun}
        onClick={wb.run}
        leadingIcon={<Icon name="play" size={15} />}
        style={{ marginTop: 18 }}
      >
        Run verification
      </Button>
    </Card>
  );
}

const Subjects = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: end;

  .mode .lbl {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fg-subtle);
    margin-bottom: 6px;
  }
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Candidates = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;
