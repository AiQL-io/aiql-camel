"use client";

import React from "react";
import styled from "styled-components";
import { Drawer } from "@/imports/core/components/Drawer.jsx";

const METHODS = [
  {
    name: "Exclusion-based parentage",
    def: "An offspring inherits one allele per locus from each parent, so a true parent shares ≥1 allele at every locus. A locus with no shared allele is an opposition (exclusion).",
    formula:
      "0 mismatches → consistent · 1..(tol+1) → inconclusive · >tol+1 → excluded",
    estimator: "Per-locus allele-sharing test (Mendelian)",
    assumptions:
      "Co-dominant STR markers; opposition beyond tolerance implies non-parentage.",
    cite: "Master Spec §6.2",
  },
  {
    name: "Combined Probability of Exclusion (CPE)",
    def: "The probability the panel excludes a random, unrelated candidate parent. Quantifies the strength of a non-exclusion.",
    formula: "CPE = 1 − Π(1 − PEₗ) over compared loci",
    estimator: "Per-locus PE from population allele frequencies",
    assumptions: "Hardy–Weinberg, unlinked loci, accurate allele frequencies.",
    cite: "Master Spec §6.2",
  },
  {
    name: "Parentage Index (PI / LR)",
    def: "A likelihood ratio: how much more probable the offspring genotype is if the candidate is the parent versus a random individual.",
    formula:
      "PI = Π (transmission probability / population probability) per locus",
    estimator: "Allele-frequency-weighted, motherless/fatherless form",
    assumptions:
      "Independent loci; estimate strengthens with more informative markers.",
    cite: "Master Spec §6.2 (advanced)",
  },
  {
    name: "Relatedness (r) — Lynch & Ritland",
    def: "Estimates the proportion of alleles shared by descent between two individuals (≈0.5 PO/FS, 0.25 HS, 0 unrelated).",
    formula: "Frequency-weighted moment estimator over IBS sharing",
    estimator:
      "Lynch & Ritland (1999); rare-allele sharing weighted more heavily",
    assumptions:
      "It is an estimate with uncertainty; PO vs FS is disambiguated by zero-sharing loci.",
    cite: "Master Spec §6.3",
  },
  {
    name: "Mutation / error tolerance",
    def: "A small number of opposition loci (default 1) is treated as inconclusive — attributable to mutation, null alleles, or genotyping error — rather than a hard exclusion.",
    formula: "Excluded only when mismatches > tolerance + 1",
    estimator: "Configurable; re-evaluates verdicts transparently",
    assumptions:
      "STR mutation rates are non-zero; a single opposition is not definitive.",
    cite: "Master Spec §6.2 / 1B §2.6",
  },
];

export function MethodsDrawer({ open, onClose }) {
  return (
    <Drawer open={open} onClose={onClose} title="Methods" width={480}>
      <List>
        {METHODS.map((m) => (
          <div className="method" key={m.name}>
            <h4>{m.name}</h4>
            <p className="def">{m.def}</p>
            <dl>
              <dt>Formula</dt>
              <dd>{m.formula}</dd>
              <dt>Estimator</dt>
              <dd>{m.estimator}</dd>
              <dt>Assumptions</dt>
              <dd>{m.assumptions}</dd>
              <dt>Reference</dt>
              <dd>{m.cite}</dd>
            </dl>
          </div>
        ))}
      </List>
    </Drawer>
  );
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;

  .method h4 {
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
  }
  .def {
    font-size: var(--text-sm);
    color: var(--fg-secondary);
    line-height: 20px;
    margin-top: 6px;
  }
  dl {
    margin-top: 10px;
    display: grid;
    grid-template-columns: 96px 1fr;
    gap: 6px 12px;
  }
  dt {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  dd {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
    line-height: 17px;
  }
`;
