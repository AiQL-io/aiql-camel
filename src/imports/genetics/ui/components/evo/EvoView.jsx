"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { EvoDesigner } from "./EvoDesigner.jsx";
import { MechInterpVisualizer } from "./MechInterpVisualizer.jsx";

const LINKS = [
  {
    label: "Evo 2 on GitHub",
    href: "https://github.com/arcinstitute/evo2",
    icon: "github-logo",
  },
  {
    label: "Evo 1 on GitHub",
    href: "https://github.com/evo-design/evo",
    icon: "github-logo",
  },
  {
    label: "Evo 2 on HuggingFace",
    href: "https://huggingface.co/arcinstitute",
    icon: "horse",
  },
  {
    label: "Evo 1 on HuggingFace",
    href: "https://huggingface.co/togethercomputer/evo-1-131k-base",
    icon: "horse",
  },
];

const TOOLS = [
  { id: "designer", label: "Designer", icon: "magic-wand" },
  { id: "interp", label: "Interpretability", icon: "brain" },
];

export function EvoView() {
  const [tool, setTool] = useState("designer");

  return (
    <Root>
      <header className="evo-hero">
        <div className="lead">
          <Overline>
            Genomic foundation model · prediction &amp; design
          </Overline>
          <h2>
            Evo 2 <span className="pill">Powered by Evo 2</span>
          </h2>
          <p>
            Evo 2 is a genomic foundation model for generalist prediction and
            design across DNA, RNA and proteins — 40B parameters, 1Mb context,
            trained on 9 trillion nucleotides. Generate and score sequences, and
            inspect the features the model has learned.
          </p>
          <div className="links">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                <Icon name={l.icon} size={14} /> {l.label}
                <Icon name="arrow-up-right" size={11} />
              </a>
            ))}
          </div>
        </div>
      </header>

      <div className="evo-note">
        <Icon name="info" size={13} />
        Prototype — sequences, scores and feature activations are illustrative
        and generated locally to demonstrate the Evo 2 workflow. They are not
        produced by the live Evo 2 model.
      </div>

      <div className="tooltabs" role="tablist">
        {TOOLS.map((tb) => (
          <button
            key={tb.id}
            type="button"
            role="tab"
            aria-selected={tool === tb.id}
            className={tool === tb.id ? "on" : ""}
            onClick={() => setTool(tb.id)}
          >
            <Icon name={tb.icon} size={15} />
            {tb.label}
          </button>
        ))}
      </div>

      <div className="tool-body">
        {tool === "designer" ? <EvoDesigner /> : <MechInterpVisualizer />}
      </div>
    </Root>
  );
}

const Root = styled.div`
  .evo-hero {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background:
      radial-gradient(
        120% 140% at 100% 0%,
        color-mix(in srgb, var(--accent) 12%, transparent) 0%,
        transparent 55%
      ),
      var(--surface);
    padding: 22px 24px;
  }
  .evo-hero h2 {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    font-size: var(--text-xl);
    font-weight: var(--weight-semibold);
    margin-top: 8px;
    color: var(--fg-heading, var(--fg));
  }
  .pill {
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--accent);
    background: var(--accent-soft);
    padding: 3px 10px;
    border-radius: var(--radius-pill);
  }
  .evo-hero p {
    max-width: 760px;
    margin-top: 8px;
    font-size: var(--text-sm);
    line-height: 1.55;
    color: var(--fg-secondary);
  }
  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }
  .links a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface);
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    transition:
      border-color 120ms ease,
      color 120ms ease;
  }
  .links a:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
  .evo-note {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-inline-start: 3px solid var(--accent);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    line-height: 1.5;
  }
  .tooltabs {
    display: flex;
    gap: 8px;
    margin-top: 18px;
  }
  .tooltabs button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 36px;
    padding: 0 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface);
    color: var(--fg-secondary);
    font-size: var(--text-sm);
    cursor: pointer;
    transition:
      border-color 120ms ease,
      color 120ms ease,
      background 120ms ease;
  }
  .tooltabs button:hover {
    border-color: var(--separator-2);
  }
  .tooltabs button.on {
    background: var(--accent-soft);
    border-color: transparent;
    color: var(--accent);
    font-weight: var(--weight-medium);
  }
  .tool-body {
    margin-top: 18px;
  }
`;
