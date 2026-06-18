"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { CompareStrip } from "@/imports/core/components/CompareStrip.jsx";
import { useIdentityMatch } from "@/imports/registry/hooks/useIdentityMatch.js";

export function IdentityMatchView({ access }) {
  const m = useIdentityMatch(access);
  const [mode, setMode] = useState("build");
  const [pasteText, setPasteText] = useState("");
  const fileRef = useRef(null);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPasteText(String(reader.result || ""));
      m.loadFromText(String(reader.result || ""));
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Link href="/registry" className="back-link">
        <Icon name="arrow-left" size={14} /> Registry
      </Link>
      <Head>
        <Overline>Forensic identity</Overline>
        <h1>Identity Matching</h1>
        <p>
          Enter a sample STR genotype to find the matching registered animal. An
          exact match across all informative loci is an identity hit; multiple
          exact matches indicate a duplicate.
        </p>
      </Head>

      <Layout>
        <Card>
          <Query>
            <div className="modes">
              <button
                type="button"
                className={mode === "build" ? "on" : ""}
                onClick={() => setMode("build")}
              >
                Build
              </button>
              <button
                type="button"
                className={mode === "paste" ? "on" : ""}
                onClick={() => setMode("paste")}
              >
                Paste / upload
              </button>
            </div>

            {mode === "build" ? (
              <>
                <div className="prefill">
                  <Select
                    block
                    value=""
                    placeholder="Prefill from a registered animal…"
                    onChange={(v) => v && m.loadFromAnimal(v)}
                    options={m.sampleAnimals.map((a) => ({
                      value: a.id,
                      label: `${a.name} · ${a.registrationId}`,
                    }))}
                  />
                </div>
                <div className="loci">
                  {m.query.map((g) => (
                    <div className="locus" key={g.locus}>
                      <span className="name">{g.locus}</span>
                      <input
                        type="number"
                        value={g.alleleA}
                        onChange={(e) =>
                          m.setAllele(g.locus, "alleleA", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        value={g.alleleB}
                        onChange={(e) =>
                          m.setAllele(g.locus, "alleleB", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="hint">
                  Paste rows of <code>LOCUS alleleA alleleB</code> (or CSV), or
                  upload a file.
                </p>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={"YWLL08 130 138\nVOLP03 170 176\n…"}
                />
                <div className="paste-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => m.loadFromText(pasteText)}
                  >
                    Parse
                  </Button>
                  <button
                    type="button"
                    className="upload"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Icon name="upload-simple" size={14} /> Upload file
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.txt,.tsv"
                    onChange={onFile}
                    hidden
                  />
                </div>
                {m.parseNote && <div className="note">{m.parseNote}</div>}
              </>
            )}

            <Button
              variant="primary"
              onClick={m.run}
              style={{ marginTop: 16, width: "100%" }}
            >
              Find matches
            </Button>
          </Query>
        </Card>

        <div>
          {m.exactMatches.length > 1 && (
            <Card style={{ marginBottom: 12, borderColor: "var(--danger)" }}>
              <div className="dup-alert">
                <Icon name="warning" size={18} />
                <span>
                  Duplicate suspected — {m.exactMatches.length} animals share
                  this exact profile.
                </span>
              </div>
            </Card>
          )}
          <Card padding={0}>
            <div className="results-head">
              <Overline>Candidate matches</Overline>
            </div>
            <div style={{ padding: 16 }}>
              {m.results.length === 0 && (
                <span className="empty">
                  Edit the genotype and run a match.
                </span>
              )}
              {m.results.map((r) => {
                const pct = Math.round(r.score * 100);
                const tone =
                  r.score === 1
                    ? "success"
                    : r.score >= 0.7
                      ? "warning"
                      : "default";
                const label = r.score === 1 ? "Identity match" : `${pct}%`;
                const on = m.selectedId === r.animal.id;
                return (
                  <Result
                    key={r.animal.id}
                    type="button"
                    $on={on}
                    onClick={() => m.setSelectedId(on ? null : r.animal.id)}
                  >
                    <div className="who">
                      <div className="nm">{r.animal.name}</div>
                      <div className="id">
                        {r.animal.registrationId} · {r.animal.breed}
                      </div>
                    </div>
                    <div className="rr">
                      <Chip size="sm" tone={tone}>
                        {label}
                      </Chip>
                      <div className="score">
                        {r.exact}/{r.compared} loci
                        {r.mismatchLoci.length
                          ? ` · ${r.mismatchLoci.length} mismatch`
                          : ""}
                      </div>
                    </div>
                  </Result>
                );
              })}
            </div>
          </Card>

          {m.selected && (
            <Card style={{ marginTop: 12 }}>
              <div className="cmp-head">
                <Overline>Side-by-side comparison</Overline>
                <Link href={`/registry/${m.selected.id}`} className="open">
                  Open profile <Icon name="arrow-right" size={12} />
                </Link>
              </div>
              <div style={{ marginTop: 12 }}>
                <CompareStrip
                  rows={[
                    { label: "Sample", sub: m.sourceLabel, geno: m.query },
                    {
                      label: m.selected.name,
                      sub: m.selected.registrationId,
                      geno: m.selectedGeno,
                    },
                  ]}
                />
              </div>
            </Card>
          )}
        </div>
      </Layout>
    </>
  );
}

const Head = styled.div`
  margin-top: 14px;

  h1 {
    font-size: var(--text-2xl);
    line-height: 40px;
    font-weight: var(--weight-medium);
    letter-spacing: -0.02em;
    margin-top: 8px;
  }
  p {
    color: var(--fg-secondary);
    font-size: var(--text-sm);
    margin-top: 6px;
    max-width: 620px;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 16px;
  margin-top: 20px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  > * {
    min-width: 0;
  }

  .dup-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--danger);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .results-head {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }
  .empty {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .cmp-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cmp-head .open {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-xs);
    color: var(--accent);
  }
`;

const Query = styled.div`
  .modes {
    display: inline-flex;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    padding: 3px;
    gap: 2px;
    margin-bottom: 14px;
  }
  .modes button {
    height: 28px;
    padding: 0 14px;
    border: none;
    background: transparent;
    border-radius: var(--radius-pill);
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .modes button.on {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .prefill {
    margin-bottom: 12px;
  }
  .loci {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .locus {
    display: grid;
    grid-template-columns: 90px 1fr 1fr;
    align-items: center;
    gap: 8px;
  }
  .locus .name {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .locus input,
  textarea {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--field-bg);
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }
  .locus input {
    height: 34px;
    padding: 0 10px;
  }
  textarea {
    min-height: 160px;
    padding: 10px;
    resize: vertical;
  }
  .hint {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-bottom: 8px;
  }
  .hint code {
    font-family: var(--font-mono);
  }
  .paste-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }
  .upload {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .note {
    margin-top: 8px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;

const Result = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  text-align: start;
  padding: 12px 14px;
  border: 1px solid ${(p) => (p.$on ? "var(--accent)" : "var(--border)")};
  background: ${(p) => (p.$on ? "var(--accent-soft)" : "transparent")};
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  cursor: pointer;

  &:hover {
    border-color: var(--separator-2);
    background: var(--surface-2);
  }
  .who .nm {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .who .id {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .rr {
    text-align: end;
  }
  .rr .score {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 4px;
  }
`;
