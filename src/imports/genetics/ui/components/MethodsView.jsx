"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { METHODS } from "./methodsRegistry.js";

export function MethodsView() {
  const entries = Object.entries(METHODS);

  return (
    <>
      <Intro>
        <Icon name="book" size={15} />
        <span>
          Reference for every statistic used across the genetics screens —
          plain-language meaning, formula, estimator, assumptions, and citation.
        </span>
      </Intro>

      <Grid>
        {entries.map(([key, m]) => (
          <Card key={key}>
            <Body>
              <Head>
                <Overline>{m.label}</Overline>
                <code className="key">{key}</code>
              </Head>
              <p className="plain">{m.plain}</p>
              <dl>
                <div>
                  <dt>Formula</dt>
                  <dd className="mono">{m.formula}</dd>
                </div>
                <div>
                  <dt>Estimator</dt>
                  <dd>{m.estimator}</dd>
                </div>
                <div>
                  <dt>Assumption</dt>
                  <dd>{m.assumption}</dd>
                </div>
                <div>
                  <dt>Citation</dt>
                  <dd>{m.citation}</dd>
                </div>
              </dl>
            </Body>
          </Card>
        ))}
      </Grid>
    </>
  );
}

const Intro = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: var(--text-sm);
  color: var(--fg-secondary);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;

  .key {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    background: var(--surface-2);
    padding: 1px 8px;
    border-radius: var(--radius-pill);
  }
`;

const Body = styled.div`
  .plain {
    font-size: var(--text-sm);
    color: var(--fg);
    margin-bottom: 14px;
  }
  dl {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
  }
  dl > div {
    display: grid;
    grid-template-columns: 92px 1fr;
    gap: 10px;
    align-items: baseline;
  }
  dt {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  dd {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  dd.mono {
    font-family: var(--font-mono);
    color: var(--fg);
  }
`;
