"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import {
  ORGANISMS,
  EXAMPLES,
  generateSequence,
  exampleSequence,
  sanitizePrompt,
} from "@/imports/genetics/data/evoMock.js";
import { SequenceViewer } from "./SequenceViewer.jsx";
import { downloadStructurePng } from "./evoExport.js";

const ProteinPanel = dynamic(
  () => import("./ProteinPanel.jsx").then((m) => m.ProteinPanel),
  {
    ssr: false,
    loading: () => <div className="viewerloading">Loading 3D viewer…</div>,
  },
);
const EvoScoreView = dynamic(
  () => import("./EvoScoreView.jsx").then((m) => m.EvoScoreView),
  {
    ssr: false,
    loading: () => <div className="scoreloading">Loading score…</div>,
  },
);

export function EvoDesigner() {
  const [mode, setMode] = useState("generate");
  const [organism, setOrganism] = useState("Human");
  const [prompt, setPrompt] = useState("");
  const [length, setLength] = useState(500);
  const [showSettings, setShowSettings] = useState(false);
  const [result, setResult] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [selectedOrf, setSelectedOrf] = useState(null);
  const [sel, setSel] = useState(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const [showLowEnt, setShowLowEnt] = useState(true);
  const pngRef = useRef(null);

  const cleanLen = sanitizePrompt(prompt).length;

  const run = () => {
    const res = generateSequence({ prompt, organism, length });
    setResult(res);
    setSelectedOrf(null);
    setSel(null);
    setShowScore(mode === "score");
  };

  const selectBase = (gi) => {
    if (!result) return;
    const idx = result.orfs.findIndex((o) => gi >= o.start && gi < o.end);
    if (idx >= 0) {
      const o = result.orfs[idx];
      const residue = Math.floor((gi - o.start) / 3);
      setSelectedOrf(idx);
      setSel({ base: o.start + residue * 3, bp: 3, residue });
    } else {
      setSel({ base: gi, bp: 1, residue: null });
    }
  };

  const applyExample = (ex) => {
    setOrganism(ex.organism);
    setPrompt(exampleSequence(ex.label, ex.prompt, 500));
    setShowScore(mode === "score");
  };

  return (
    <Root>
      <div className="modecards">
        <button
          type="button"
          className={mode === "generate" ? "mc on" : "mc"}
          onClick={() => {
            setMode("generate");
            setShowScore(false);
          }}
        >
          <Icon name="magic-wand" size={18} />
          <div>
            <b>Generate a sequence</b>
            <span>
              Prompt the model with a DNA sequence or organism to continue it,
              and highlight protein-coding regions.
            </span>
          </div>
        </button>
        <button
          type="button"
          className={mode === "score" ? "mc on" : "mc"}
          onClick={() => {
            setMode("score");
            setShowScore(true);
          }}
        >
          <Icon name="chart-bar" size={18} />
          <div>
            <b>Score a sequence</b>
            <span>
              Provide a DNA sequence to get an entropy score, per base pair.
            </span>
          </div>
        </button>
      </div>

      <div className="inputbar">
        <label className="org">
          <span>Organism</span>
          <select
            value={organism}
            onChange={(e) => {
              setOrganism(e.target.value);
              setShowScore(mode === "score");
            }}
          >
            {ORGANISMS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <Icon name="caret-down" size={13} />
        </label>
        <textarea
          className="prompt"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setShowScore(mode === "score");
          }}
          placeholder={
            mode === "generate"
              ? "Enter a sequence up to 500 bases long"
              : "Paste a DNA sequence to score"
          }
          spellCheck={false}
        />
        <div className="ia">
          {prompt && (
            <button
              type="button"
              className="iconbtn"
              aria-label="Clear input"
              onClick={() => {
                setPrompt("");
                setShowScore(mode === "score");
              }}
            >
              <Icon name="x-circle" size={18} />
            </button>
          )}
          <button
            type="button"
            className="iconbtn"
            aria-label="Settings"
            onClick={() => setShowSettings((s) => !s)}
          >
            <Icon name="sliders-horizontal" size={16} />
          </button>
          <button type="button" className="run" onClick={run}>
            {mode === "generate" ? "Generate" : "Score"}
            <Icon name="arrow-up" size={14} />
          </button>
        </div>
      </div>

      <div className="meta">
        <span className="bp">{cleanLen} base pairs</span>
        {showSettings && (
          <span className="setting">
            Length
            <input
              type="range"
              min={120}
              max={700}
              step={20}
              value={length}
              onChange={(e) => setLength(+e.target.value)}
            />
            <b>{length}</b>
          </span>
        )}
      </div>

      <div className="examples">
        {EXAMPLES.map((ex) => (
          <button key={ex.label} type="button" onClick={() => applyExample(ex)}>
            {ex.label}
          </button>
        ))}
      </div>

      {result && (
        <Result>
          <header className="rh">
            <h3>
              {mode === "generate" ? "Generated Sequence" : "Scored Sequence"}{" "}
              <span>{result.bases.length} base pairs</span>
            </h3>
            <div className="actions">
              <button type="button">
                <Icon name="git-branch" size={13} /> BLAST
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadStructurePng(result, selectedOrf, pngRef)
                }
              >
                <Icon name="download-simple" size={13} /> Download
              </button>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard?.writeText(result.bases).catch(() => {})
                }
              >
                <Icon name="copy" size={13} /> Copy
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => setShowScore((s) => !s)}
              >
                {showScore ? "View Sequence" : "View Score"}
              </button>
            </div>
          </header>

          {showScore ? (
            <EvoScoreView result={result} />
          ) : (
            <>
              <div className="legendrow">
                <div className="lkeys">
                  <label className="lk">
                    <i className="chip atg">ATG</i> Prompt
                    <input
                      type="checkbox"
                      checked={showPrompt}
                      onChange={(e) => setShowPrompt(e.target.checked)}
                    />
                  </label>
                  <label className="lk">
                    <i className="chip cgt">CGT</i> Low entropy
                    <input
                      type="checkbox"
                      checked={showLowEnt}
                      onChange={(e) => setShowLowEnt(e.target.checked)}
                    />
                  </label>
                  <span className="lk">
                    <i className="chip orf">ORF {selectedOrf ?? 0}</i>
                    <i className="bar protein" />
                    Protein
                  </span>
                  {sel && (
                    <span className="selinfo">
                      Selected{" "}
                      <b>
                        {sel.base + 1} - {sel.base + sel.bp + 1}
                      </b>{" "}
                      ({sel.bp} bp)
                    </span>
                  )}
                </div>
                <div className="lhead">
                  <b>Protein Structure</b>
                  {selectedOrf != null && (
                    <span>Viewing ORF {selectedOrf}</span>
                  )}
                </div>
              </div>
              <div className="seqgrid">
                <SequenceViewer
                  result={result}
                  selectedOrf={selectedOrf}
                  selection={sel}
                  showPrompt={showPrompt}
                  showLowEnt={showLowEnt}
                  onSelectOrf={(idx) => {
                    setSelectedOrf(idx);
                    setSel(null);
                  }}
                  onSelectBase={selectBase}
                />
                <ProteinPanel
                  result={result}
                  selectedOrf={selectedOrf}
                  selResidue={sel ? sel.residue : null}
                  pngRef={pngRef}
                />
              </div>
            </>
          )}
        </Result>
      )}
    </Root>
  );
}

const Root = styled.div`
  .modecards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .mc {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    text-align: start;
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
    cursor: pointer;
    color: var(--fg);
  }
  .mc.on {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .mc b {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .mc span {
    display: block;
    margin-top: 4px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    line-height: 1.45;
  }
  .inputbar {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 16px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
  }
  .org {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    white-space: nowrap;
    flex: none;
  }
  .org select {
    appearance: none;
    border: none;
    background: transparent;
    color: var(--fg);
    font-size: var(--text-sm);
    font-family: inherit;
    padding-inline-end: 14px;
    cursor: pointer;
  }
  .org > svg {
    position: absolute;
    inset-inline-end: 6px;
    pointer-events: none;
    color: var(--fg-subtle);
  }
  .prompt {
    flex: 1;
    min-width: 0;
    height: 104px;
    resize: none;
    border: none;
    background: transparent;
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.55;
    letter-spacing: 0.02em;
    word-break: break-all;
    outline: none;
    overflow-y: auto;
  }
  .ia {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: none;
  }
  .iconbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: none;
    background: transparent;
    color: var(--fg-subtle);
    border-radius: var(--radius-pill);
    cursor: pointer;
  }
  .iconbtn:hover {
    background: var(--surface-2);
    color: var(--fg);
  }
  .run {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    padding: 0 18px;
    border: none;
    border-radius: var(--radius-pill);
    background: var(--accent);
    color: #fff;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    cursor: pointer;
  }
  .run:hover {
    filter: brightness(1.05);
  }
  .meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin-top: 10px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .meta .setting {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .meta .setting b {
    font-family: var(--font-mono);
    color: var(--fg-secondary);
  }
  .examples {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
  }
  .examples button {
    height: 32px;
    padding: 0 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface);
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .examples button:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`;

const Result = styled.div`
  /* Force a light theme for this card so it matches the reference tool. */
  --surface: #ffffff;
  --surface-2: #f1f5f9;
  --surface-3: #f8fafc;
  --bg-muted: #f1f5f9;
  --field-bg: #f1f5f9;
  --fg: #16233c;
  --fg-secondary: #475569;
  --fg-subtle: #8a98ac;
  --fg-muted: #c3ccd9;
  --fg-disabled: #c3ccd9;
  --border: #e4e9f0;
  --separator: #eef2f6;
  --separator-2: #cbd5e1;
  --accent: #2563eb;
  --accent-soft: #e6edff;

  margin-top: 22px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  color: var(--fg);
  overflow: hidden;

  .rh {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);
  }
  .rh h3 {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .rh h3 span {
    color: var(--fg-subtle);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    margin-inline-start: 6px;
  }
  .actions {
    display: flex;
    gap: 6px;
  }
  .actions button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 30px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface);
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .actions button:hover {
    border-color: var(--separator-2);
    color: var(--fg);
  }
  .actions .primary {
    border-color: var(--accent);
    color: var(--accent);
  }
  .legendrow {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0;
    padding: 12px 18px 0;
  }
  .lkeys {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: var(--text-xs);
    color: var(--fg-secondary);
    flex-wrap: wrap;
  }
  .lk {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .lk .chip {
    font-style: normal;
    font-family: var(--font-mono);
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 0;
    color: #1e293b;
  }
  .lk .chip.atg {
    background: #dbeafe;
  }
  .lk .chip.cgt {
    background: rgba(0, 255, 0, 0.5);
    color: #64748b;
  }
  .lk .chip.orf {
    background: #ddd6fe;
    color: #2a2a2a;
  }
  .lk .bar.protein {
    width: 22px;
    height: 8px;
    border-radius: 0;
    background: #ddd6fe;
  }
  .lk input[type="checkbox"] {
    width: 13px;
    height: 13px;
    accent-color: var(--accent);
    cursor: pointer;
  }
  label.lk {
    cursor: pointer;
  }
  .lkeys .hint {
    color: var(--fg-subtle);
  }
  .selinfo {
    color: var(--fg-secondary);
    white-space: nowrap;
  }
  .selinfo b {
    font-family: var(--font-mono);
    color: var(--fg);
  }
  .lhead {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .lhead b {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .lhead span {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .seqgrid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0;
  }
  .viewerloading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 520px;
    margin: 14px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: #f7f9fc;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
  }
  .scoreloading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 320px;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
  }
  @media (max-width: 900px) {
    .legendrow,
    .seqgrid {
      grid-template-columns: 1fr;
    }
  }
`;
