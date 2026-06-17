"use client";

import React from "react";
import styled from "styled-components";
import { ParentSlot } from "./ParentSlot.jsx";

export function PedigreeTree({ ped }) {
  if (!ped) return null;
  return (
    <Wrap>
      <div className="parents">
        <ParentSlot role="Sire" slot={ped.sire} />
        <ParentSlot role="Dam" slot={ped.dam} />
      </div>
      <div className="connector">
        <span />
      </div>
      <div className="self">
        <div className="card self-card">{ped.self.name}</div>
      </div>
      <Legend>
        <span>
          <i className="ln biology" /> biology-confirmed
        </span>
        <span>
          <i className="ln registry" /> registry-only
        </span>
      </Legend>
    </Wrap>
  );
}

const Wrap = styled.div`
  .parents {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .connector {
    height: 24px;
    position: relative;
  }
  .connector span {
    position: absolute;
    left: 25%;
    right: 25%;
    top: 0;
    height: 12px;
    border: 1px solid var(--separator-2);
    border-bottom: none;
    border-radius: 6px 6px 0 0;
  }
  .self {
    display: flex;
    justify-content: center;
  }
  .self-card {
    background: var(--accent-soft);
    border-color: var(--accent) !important;
    color: var(--fg);
    font-weight: var(--weight-medium);
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 14px;
  font-size: var(--text-xs);
  color: var(--fg-subtle);

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .ln {
    width: 16px;
    height: 0;
    border-top: 2px solid var(--separator-2);
  }
  .ln.registry {
    border-top-style: dashed;
  }
  .ln.biology {
    border-top-color: var(--status-success);
  }
`;
