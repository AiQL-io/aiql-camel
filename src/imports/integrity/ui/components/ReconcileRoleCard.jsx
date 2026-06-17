"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { VERDICT_TONE, num, fmtPI } from "./reconcileHelpers.js";

export function ReconcileRoleCard({ m, subjectId, mayResolve, onAct }) {
  return (
    <RoleCard padding={0}>
      <RoleHead $conflict={Boolean(m.contradiction)}>
        <Icon
          name={m.role === "sire" ? "gender-male" : "gender-female"}
          size={16}
        />
        <b>{m.role === "sire" ? "Sire" : "Dam"} line</b>
        {m.contradiction ? (
          <span className="flag">
            <Icon name="warning" size={13} /> {m.contradiction}
          </span>
        ) : (
          <span className="ok">
            <Icon name="check" size={13} /> Registry and biology agree.
          </span>
        )}
      </RoleHead>

      <SideBySide>
        <div className="col reg">
          <span className="hd">Registry says</span>
          {m.declared ? (
            <>
              <Link className="animal" href={`/registry/${m.declared.id}`}>
                <span className="reg">{m.declared.reg}</span>
                <span className="nm">{m.declared.name}</span>
              </Link>
              <div className="check">
                <span>Verdict vs. subject</span>
                <CapChip
                  size="sm"
                  tone={VERDICT_TONE[m.declaredVerify?.verdict] || "default"}
                >
                  {m.declaredVerify?.verdict || "—"}
                </CapChip>
              </div>
              {m.declaredExcluded && (
                <div className="loci">
                  <span>Opposition loci</span>
                  <code>{m.declaredVerify.mismatchLoci.join(", ")}</code>
                </div>
              )}
              <div className="metrics">
                <span>
                  Relatedness r <b>{num(m.declaredRel?.r)}</b>
                </span>
                <span>
                  Loci compared <b>{m.declaredVerify?.lociCompared ?? "—"}</b>
                </span>
              </div>
            </>
          ) : (
            <div className="empty">No {m.role} on record.</div>
          )}
        </div>

        <div className="divider">
          <Icon name="git-diff" size={16} />
        </div>

        <div className="col bio">
          <span className="hd">Biology says</span>
          {m.candidates.length === 0 ? (
            <div className="empty">
              No consistent candidate in the current pool ({m.poolSize}{" "}
              screened).
            </div>
          ) : (
            m.candidates.map((c) => (
              <div className={`cand${c.bestFit ? " best" : ""}`} key={c.id}>
                <Link className="animal" href={`/registry/${c.id}`}>
                  <span className="reg">{c.reg}</span>
                  <span className="nm">{c.name}</span>
                </Link>
                <div className="tags">
                  {c.isDeclared && (
                    <Chip size="sm" tone="default">
                      = declared
                    </Chip>
                  )}
                  {c.bestFit && (
                    <Chip size="sm" tone="success">
                      best fit
                    </Chip>
                  )}
                  <span className="m">
                    PI <b>{fmtPI(c.parentageIndex)}</b>
                  </span>
                  <span className="m">
                    r <b>{num(c.r)}</b>
                  </span>
                  <span className="m">
                    mismatch <b>{c.mismatchCount}</b>/{c.lociCompared}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </SideBySide>

      <Actions>
        <Button
          size="sm"
          variant="primary"
          disabled={!mayResolve || !m.topCandidate}
          onClick={() =>
            onAct(
              "Accept biological correction",
              m.role,
              m.topCandidate ? `set ${m.role} → ${m.topCandidate.reg}` : "",
            )
          }
          leadingIcon={<Icon name="check-circle" size={14} />}
        >
          Accept biological correction
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!mayResolve}
          onClick={() =>
            onAct(
              "Propose registry update",
              m.role,
              "change request submitted for review",
            )
          }
          leadingIcon={<Icon name="git-pull-request" size={14} />}
        >
          Propose registry update
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={!mayResolve}
          onClick={() => onAct("Escalate", m.role, "escalated to registrar")}
          leadingIcon={<Icon name="arrow-up-right" size={14} />}
        >
          Escalate
        </Button>
        <Button
          size="sm"
          variant="ghost"
          as={Link}
          href={`/verify?subject=${subjectId}`}
          leadingIcon={<Icon name="flask" size={14} />}
        >
          Open in Workbench
        </Button>
      </Actions>
    </RoleCard>
  );
}

const RoleCard = styled(Card)`
  margin-top: 16px;
  overflow: hidden;
`;

const CapChip = styled(Chip)`
  text-transform: capitalize;
`;

const RoleHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: ${(p) =>
    p.$conflict
      ? "color-mix(in srgb, var(--danger) 6%, var(--surface))"
      : "var(--bg-muted)"};

  b {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .flag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-inline-start: auto;
    font-size: var(--text-sm);
    color: var(--danger);
    text-align: end;
  }
  .ok {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-inline-start: auto;
    font-size: var(--text-sm);
    color: var(--status-success);
  }
`;

const SideBySide = styled.div`
  display: grid;
  grid-template-columns: 1fr 40px 1fr;
  align-items: stretch;

  .col {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .col.bio {
    background: var(--accent-soft);
  }
  .hd {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .animal {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .animal .reg {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .animal .nm {
    font-size: var(--text-base);
    color: var(--fg);
  }
  .check,
  .loci,
  .metrics {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  .metrics {
    gap: 18px;
    flex-wrap: wrap;
  }
  .metrics b,
  .cand b {
    font-family: var(--font-mono);
    color: var(--fg);
  }
  .loci code {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--danger);
  }
  .divider {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--fg-muted);
    border-inline: 1px solid var(--separator);
  }
  .empty {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .cand {
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .cand.best {
    border-color: var(--status-success);
  }
  .cand .tags {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .cand .m {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 14px 18px;
  border-top: 1px solid var(--border);
`;
