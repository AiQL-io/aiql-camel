"use client";

import React from "react";
import styled from "styled-components";

export function ScreePlot({ scree }) {
  const max = Math.max(...scree.map((s) => s.variance), 0.01);
  return (
    <Root>
      {scree.map((s) => (
        <div className="bar" key={s.axis}>
          <span className="track">
            <span
              className="fill"
              style={{ height: `${(s.variance / max) * 100}%` }}
            />
          </span>
          <span className="lab">{s.axis}</span>
          <span className="val">{Math.round(s.variance * 100)}%</span>
        </div>
      ))}
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 140px;

  .bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex: 1;
    height: 100%;
    justify-content: flex-end;
  }
  .track {
    width: 60%;
    flex: 1;
    display: flex;
    align-items: flex-end;
  }
  .fill {
    width: 100%;
    background: var(--accent);
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  }
  .lab {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .val {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg);
  }
`;
