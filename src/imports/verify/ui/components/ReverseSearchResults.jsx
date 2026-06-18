"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { CompareStrip } from "@/imports/core/components/CompareStrip.jsx";
import { confirmHref } from "./reverseSearchHelpers.js";

export function ReverseSearchResults({
  rs,
  res,
  survivors,
  exactCount,
  onExport,
  onFinalize,
}) {
  return (
    <Root>
      {!res && (
        <Card>
          <Empty>
            Pick an offspring and search — the platform proposes candidate
            parents consistent with its DNA, respecting sex and plausible age.
          </Empty>
        </Card>
      )}

      {res && res.error && (
        <Card>
          <RO>
            <Icon name="warning" size={16} /> Offspring has no usable DNA
            profile — can&apos;t search.
          </RO>
        </Card>
      )}

      {res && !res.error && (
        <>
          <Card padding={0}>
            <div className="rs-head">
              <Overline>Candidate {rs.target}s</Overline>
              <div className="rs-head-right">
                <span className="pool">
                  pool {res.poolSize.toLocaleString()} → excluded{" "}
                  {res.excluded.toLocaleString()} → survivors {survivors.length}
                </span>
                <button type="button" className="exp" onClick={onExport}>
                  <Icon name="download-simple" size={13} /> Export
                </button>
              </div>
            </div>
            <div className="prov">
              Provenance · sex {rs.target === "dam" ? "female" : "male"} · min
              age {rs.minParentAge}y · region {rs.region || "any"} · owner{" "}
              {rs.owner ? "filtered" : "any"} · tolerance {rs.tolerance} · DNA
              required
            </div>

            {survivors.length === 0 ? (
              <NoResult>
                <Icon name="binoculars" size={26} color="var(--fg-muted)" />
                <p>No consistent candidate found.</p>
                <ul>
                  <li>
                    The true parent may be unprofiled or absent from the
                    registry.
                  </li>
                  <li>
                    Constraints may be too tight — widen region/owner or lower
                    min age.
                  </li>
                  <li>The offspring profile may be incomplete.</li>
                </ul>
              </NoResult>
            ) : (
              <div className="rows">
                {exactCount > 1 && (
                  <div className="ambig">
                    <Icon name="warning" size={14} /> {exactCount} candidates
                    fit exactly — add the known other parent (trio) or more
                    markers to disambiguate.
                  </div>
                )}
                {survivors.map((s, i) => {
                  const on = rs.selectedId === s.animal.id;
                  return (
                    <Row key={s.animal.id} $on={on}>
                      <button
                        type="button"
                        className="main"
                        onClick={() => rs.setSelectedId(s.animal.id)}
                      >
                        <span className="rank">{i + 1}</span>
                        <span className="who">
                          <span className="nm">
                            {s.animal.name}
                            {s.bestFit && (
                              <Chip
                                size="sm"
                                tone="success"
                                style={{ marginInlineStart: 8 }}
                              >
                                best fit
                              </Chip>
                            )}
                          </span>
                          <span className="id">{s.animal.registrationId}</span>
                        </span>
                        <span className="stat">
                          <span
                            className={
                              s.mismatchCount === 0 ? "mm ok" : "mm warn"
                            }
                          >
                            {s.mismatchCount === 0
                              ? "0 mismatch"
                              : `${s.mismatchCount} mismatch · possible mutation`}
                          </span>
                          <span className="sub">
                            PI {s.parentageIndex.toExponential(1)} · r{" "}
                            {s.r.toFixed(2)} · {s.inferred}
                            {s.trioConsistent != null &&
                              (s.trioConsistent ? " · trio ✓" : " · trio ✗")}
                          </span>
                        </span>
                      </button>
                      <Button
                        as={Link}
                        href={confirmHref({
                          offspringId: rs.offspringId,
                          candId: s.animal.id,
                          target: rs.target,
                          otherParentId: rs.otherParentId,
                        })}
                        variant="secondary"
                        size="sm"
                      >
                        Confirm
                      </Button>
                    </Row>
                  );
                })}
              </div>
            )}
          </Card>

          {rs.selected && (
            <Card style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <Overline style={{ marginBottom: 12 }}>
                  Per-locus comparison · {rs.selected.name}
                </Overline>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onFinalize}
                  leadingIcon={<Icon name="folder-plus" size={14} />}
                >
                  Finalize to case
                </Button>
              </div>
              <CompareStrip
                rows={[
                  {
                    label: rs.offspring?.name,
                    sub: rs.offspring?.registrationId,
                    geno: rs.offProf?.genotypes || [],
                  },
                  {
                    label: rs.selected.name,
                    sub: `${rs.selected.registrationId} · candidate ${rs.target}`,
                    geno: rs.selProf?.genotypes || [],
                  },
                ]}
              />
            </Card>
          )}
        </>
      )}
    </Root>
  );
}

const Root = styled.div`
  .rs-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }
  .pool {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .rs-head-right {
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }
  .rs-head-right .exp {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 26px;
    padding: 0 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .prov {
    padding: 8px 20px 0;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--fg-subtle);
  }
  .rows {
    padding: 10px;
  }
  .ambig {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 6px 10px;
    padding: 8px 12px;
    border: 1px solid var(--warning);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--warning) 8%, var(--surface));
    color: var(--warning);
    font-size: var(--text-xs);
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px solid ${(p) => (p.$on ? "var(--accent)" : "transparent")};
  background: ${(p) => (p.$on ? "var(--accent-soft)" : "transparent")};
  border-radius: var(--radius-md);

  .main {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: start;
    min-width: 0;
  }
  .rank {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--fg-subtle);
    width: 18px;
    flex: none;
  }
  .who {
    min-width: 0;
  }
  .who .nm {
    display: flex;
    align-items: center;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .who .id {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .stat {
    margin-inline-start: auto;
    text-align: end;
    min-width: 0;
  }
  .stat .mm {
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
  }
  .stat .mm.ok {
    color: var(--status-success);
  }
  .stat .mm.warn {
    color: var(--status-warning);
  }
  .stat .sub {
    display: block;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--fg-subtle);
    margin-top: 2px;
  }
`;

const Empty = styled.div`
  font-size: var(--text-sm);
  color: var(--fg-subtle);
  line-height: 20px;
`;

const NoResult = styled.div`
  padding: 28px 20px;
  text-align: center;

  p {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    margin-top: 8px;
  }
  ul {
    list-style: none;
    margin-top: 10px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    line-height: 19px;
  }
`;

const RO = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-sm);
  color: var(--fg-secondary);
`;
