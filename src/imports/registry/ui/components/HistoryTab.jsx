"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function HistoryTab({ access, animal, profile }) {
  return (
    <Card>
      <Feed>
        <div className="row">
          <span className="ic">
            <Icon name="identification-card" size={16} />
          </span>
          <span>
            <span className="t">Registered in the Camel Club registry</span>
            <span className="d">{animal.createdAt}</span>
          </span>
        </div>
        <div className="row">
          <span className="ic">
            <Icon name="dna" size={16} />
          </span>
          <span>
            <span className="t">
              DNA profile analyzed · {profile.labReportRef}
            </span>
            <span className="d">{profile.analysisDate}</span>
          </span>
        </div>
        {access.getAudit(animal.id).map((e) => (
          <div className="row" key={e.id}>
            <span className="ic">
              <Icon name="note-pencil" size={16} />
            </span>
            <span>
              <span className="t">{e.action}</span>
              <span className="d">{e.timestamp}</span>
            </span>
          </div>
        ))}
      </Feed>
    </Card>
  );
}

const Feed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  .row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .row .ic {
    color: var(--fg-subtle);
    margin-top: 1px;
  }
  .row .t {
    font-size: var(--text-sm);
    display: block;
  }
  .row .d {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 2px;
    display: block;
  }
`;
