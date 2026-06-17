"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { SegmentedControl } from "@/imports/core/components/SegmentedControl.jsx";

export function AuditControls({ ba }) {
  return (
    <Card>
      <Title>Batch source · {ba.source}</Title>
      <Controls>
        <div className="scope">
          <span className="lbl">Audit declared links</span>
          <SegmentedControl
            value={ba.scope}
            onChange={ba.setScope}
            options={[
              { value: "sire", label: "Sire" },
              { value: "dam", label: "Dam" },
              { value: "both", label: "Both" },
            ]}
          />
        </div>
        <Select
          size="sm"
          value={ba.region}
          onChange={ba.setRegion}
          options={[
            { value: "", label: "All regions" },
            ...ba.facets.regions.map((r) => ({ value: r, label: r })),
          ]}
        />
        <Select
          size="sm"
          value={ba.breed}
          onChange={ba.setBreed}
          options={[
            { value: "", label: "All lines" },
            ...ba.facets.breeds.map((b) => ({ value: b, label: b })),
          ]}
        />
        <Select
          size="sm"
          value={ba.owner}
          onChange={ba.setOwner}
          options={[
            { value: "", label: "All owners" },
            ...ba.facets.owners.map((o) => ({ value: o.id, label: o.name })),
          ]}
        />
        {ba.running ? (
          <Button
            variant="danger"
            size="sm"
            onClick={ba.cancel}
            leadingIcon={<Icon name="x" size={14} />}
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={ba.run}
            leadingIcon={<Icon name="play" size={14} />}
          >
            Run batch
          </Button>
        )}
      </Controls>
    </Card>
  );
}

const Title = styled(Overline)`
  display: block;
  margin-bottom: 12px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  .scope .lbl {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fg-subtle);
    margin-bottom: 6px;
  }
`;
