"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { SegmentedControl } from "@/imports/core/components/SegmentedControl.jsx";
import { SubjectPicker } from "./SubjectPicker.jsx";
import { ToleranceControl } from "./ToleranceControl.jsx";

export function ReverseSearchParams({ access, rs }) {
  return (
    <Card>
      <Overline style={{ marginBottom: 12 }}>Search parameters</Overline>
      <SubjectPicker
        access={access}
        value={rs.offspringId}
        onChange={rs.setOffspringId}
        label="Offspring"
        role="offspring"
      />
      <Field>
        <span className="lbl">Search for</span>
        <SegmentedControl
          value={rs.target}
          onChange={rs.setTarget}
          options={[
            { value: "sire", label: "Sire" },
            { value: "dam", label: "Dam" },
            { value: "both", label: "Both" },
          ]}
        />
      </Field>
      <Grid2>
        <Field>
          <span className="lbl">Min parent age</span>
          <Select
            block
            size="sm"
            value={String(rs.minParentAge)}
            onChange={(v) => rs.setMinParentAge(Number(v))}
            options={[2, 3, 4, 5].map((n) => ({
              value: String(n),
              label: `${n} years`,
            }))}
          />
        </Field>
        <Field>
          <span className="lbl">Region</span>
          <Select
            block
            size="sm"
            value={rs.region}
            onChange={rs.setRegion}
            options={[
              { value: "", label: "Any region" },
              ...rs.facets.regions.map((r) => ({ value: r, label: r })),
            ]}
          />
        </Field>
      </Grid2>
      <Field>
        <span className="lbl">Owner</span>
        <Select
          block
          size="sm"
          value={rs.owner}
          onChange={rs.setOwner}
          options={[
            { value: "", label: "Any owner" },
            ...rs.facets.owners.map((o) => ({ value: o.id, label: o.name })),
          ]}
        />
      </Field>
      <Field>
        <span className="lbl">Tolerance</span>
        <ToleranceControl value={rs.tolerance} onChange={rs.setTolerance} />
      </Field>
      <Field>
        <SubjectPicker
          access={access}
          value={rs.otherParentId}
          onChange={rs.setOtherParentId}
          label="Known other parent (optional → trio)"
          role={rs.target === "dam" ? "sire" : "dam"}
          offspring={rs.offspring}
        />
      </Field>
      <Button
        variant="primary"
        disabled={!rs.canSearch}
        onClick={rs.run}
        leadingIcon={<Icon name="magnifying-glass" size={15} />}
        style={{ width: "100%", marginTop: 6 }}
      >
        Search registry
      </Button>
    </Card>
  );
}

const Field = styled.div`
  margin-top: 14px;

  .lbl {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fg-subtle);
    margin-bottom: 6px;
  }
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;
