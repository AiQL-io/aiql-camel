"use client";

import React from "react";
import styled from "styled-components";
import { Drawer } from "@/imports/core/components/Drawer.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { useMethod } from "@/imports/genetics/state/methodsStore.js";
import { METHODS } from "./methodsRegistry.js";

export function MethodsDrawer() {
  const { openKey, closeMethod } = useMethod();
  const m = openKey ? METHODS[openKey] : null;
  return (
    <Drawer
      open={Boolean(m)}
      onClose={closeMethod}
      title={m ? m.label : "Method"}
      width={460}
    >
      {m && (
        <Body>
          <section>
            <Overline>Definition</Overline>
            <p>{m.plain}</p>
          </section>
          <section>
            <Overline>Estimator / formula</Overline>
            <code>{m.formula}</code>
            <p className="est">{m.estimator}</p>
          </section>
          <section>
            <Overline>Key assumption</Overline>
            <p>{m.assumption}</p>
          </section>
          <section>
            <Overline>Citation</Overline>
            <p className="cite">{m.citation}</p>
          </section>
        </Body>
      )}
    </Drawer>
  );
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  section p {
    margin-top: 6px;
    font-size: var(--text-sm);
    color: var(--fg-secondary);
    line-height: var(--leading-normal);
  }
  code {
    display: block;
    margin-top: 6px;
    padding: 10px 12px;
    background: var(--surface-2);
    border: 1px solid var(--separator);
    border-radius: var(--radius-md);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--fg);
  }
  .est {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .cite {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;
