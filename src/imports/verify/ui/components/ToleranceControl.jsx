"use client";

import React from "react";
import styled from "styled-components";

export function ToleranceControl({ value = 1, onChange, disabled = false }) {
  return (
    <Wrap title="Mismatches up to (tolerance + 1) are flagged inconclusive, not excluded">
      <span className="lbl">Tolerance</span>
      <div className="seg">
        {[0, 1, 2, 3].map((t) => (
          <button
            key={t}
            type="button"
            className={value === t ? "on" : ""}
            disabled={disabled}
            onClick={() => onChange?.(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  .lbl {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .seg {
    display: inline-flex;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }
  .seg button {
    width: 30px;
    height: 30px;
    border: none;
    background: transparent;
    color: var(--fg-secondary);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    cursor: pointer;
  }
  .seg button.on {
    background: var(--accent-soft);
    color: var(--accent);
    font-weight: var(--weight-medium);
  }
  .seg button:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
