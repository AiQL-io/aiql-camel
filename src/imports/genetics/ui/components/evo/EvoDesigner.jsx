"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import {
  ORGANISMS,
  EXAMPLES,
  generateSequence,
  exampleSequence,
  complement,
  sanitizePrompt,
  buildProteinPdb,
  BASE_COLORS,
  AA_COLORS,
} from "@/imports/genetics/data/evoMock.js";
import { EvoScoreView } from "./EvoScoreView.jsx";

let molPromise = null;
function load3Dmol() {
  if (typeof window === "undefined")
    return Promise.reject(new Error("no window"));
  if (window.$3Dmol) return Promise.resolve(window.$3Dmol);
  if (molPromise) return molPromise;
  molPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/3dmol@2.4.2/build/3Dmol-min.js";
    s.async = true;
    s.onload = () => resolve(window.$3Dmol);
    s.onerror = () => reject(new Error("3Dmol load failed"));
    document.head.appendChild(s);
  });
  return molPromise;
}

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
  };

  return (
    <Root>
      <div className="modecards">
        <button
          type="button"
          className={mode === "generate" ? "mc on" : "mc"}
          onClick={() => setMode("generate")}
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
          onClick={() => setMode("score")}
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
            onChange={(e) => setOrganism(e.target.value)}
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
          onChange={(e) => setPrompt(e.target.value)}
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
              onClick={() => setPrompt("")}
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
              <button type="button">
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
                  <span className="lk">
                    <i className="chip atg">ATG</i> Prompt
                  </span>
                  <span className="lk">
                    <i className="chip cgt">CGT</i> Low entropy
                  </span>
                  {sel ? (
                    <span className="selinfo">
                      Selected{" "}
                      <b>
                        {sel.base + 1} - {sel.base + sel.bp + 1}
                      </b>{" "}
                      ({sel.bp} bp)
                    </span>
                  ) : (
                    <span className="hint">Click the sequence or an ORF →</span>
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
                />
              </div>
            </>
          )}
        </Result>
      )}
    </Root>
  );
}

function SequenceViewer({
  result,
  selectedOrf,
  selection,
  onSelectOrf,
  onSelectBase,
}) {
  const { bases, promptLen, entropy, orfs, lowEntropyThreshold } = result;
  const selLo = selection ? selection.base : -1;
  const selHi = selection ? selection.base + selection.bp : -1;
  const comp = useMemo(() => complement(bases), [bases]);
  const scrollRef = useRef(null);
  const measureRef = useRef(null);
  const [lineLen, setLineLen] = useState(60);

  useEffect(() => {
    const compute = () => {
      const sc = scrollRef.current;
      const ms = measureRef.current;
      if (!sc || !ms) return;
      const chW = ms.getBoundingClientRect().width / 60;
      const avail = sc.clientWidth - 16;
      if (chW > 0 && avail > 0) {
        setLineLen(Math.max(20, Math.floor(avail / chW)));
      }
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (scrollRef.current) ro.observe(scrollRef.current);
    return () => ro.disconnect();
  }, []);

  const starts = [];
  for (let i = 0; i < bases.length; i += lineLen) starts.push(i);

  return (
    <Seq>
      <span ref={measureRef} className="measure" aria-hidden="true" />
      <div className="scroll" ref={scrollRef}>
        {starts.map((start) => {
          const end = Math.min(start + lineLen, bases.length);
          const seg = bases.slice(start, end).split("");
          const cseg = comp.slice(start, end).split("");
          const lineOrfs = orfs
            .map((o, idx) => ({ o, idx }))
            .filter(({ o }) => o.start < end && o.end > start);

          const ruler = [];
          for (let p = start; p < end; p++) {
            if ((p + 1) % 10 === 0) ruler.push(p);
          }

          return (
            <div className="block" key={start}>
              <div className="row seqrow">
                {seg.map((b, j) => {
                  const gi = start + j;
                  const isPrompt = gi < promptLen;
                  const low = entropy[gi] <= lowEntropyThreshold;
                  const isSel = gi >= selLo && gi < selHi;
                  return (
                    <span
                      key={j}
                      className={`b${isSel ? " sel" : isPrompt ? " prompt" : low ? " lowent" : ""}`}
                      style={{ color: BASE_COLORS[b] }}
                      onClick={() => onSelectBase(gi)}
                    >
                      {b}
                    </span>
                  );
                })}
              </div>
              <div className="row seqrow comp">
                {cseg.map((b, j) => {
                  const gi = start + j;
                  const isSel = gi >= selLo && gi < selHi;
                  return (
                    <span
                      key={j}
                      className={`b${isSel ? " sel" : ""}`}
                      style={{ color: BASE_COLORS[b] }}
                      onClick={() => onSelectBase(gi)}
                    >
                      {b}
                    </span>
                  );
                })}
              </div>

              {lineOrfs.map(({ o, idx }) => {
                const firstC = Math.max(0, Math.ceil((start - o.start) / 3));
                const items = [];
                for (let c = firstC; c < o.aa.length; c++) {
                  const cb = o.start + 3 * c;
                  if (cb >= end) break;
                  items.push({ aa: o.aa[c], offset: cb - start });
                }
                if (!items.length) return null;
                return (
                  <div className="orftrack" key={idx}>
                    <button
                      type="button"
                      className={`orf${selectedOrf === idx ? " on" : ""}`}
                      style={{ left: `${items[0].offset}ch` }}
                      onClick={() => onSelectOrf(idx)}
                      title={`ORF ${idx} · ${o.aa.replace(/\*$/, "").length} aa`}
                    >
                      {items.map((it, k) => (
                        <span
                          key={k}
                          className="aa"
                          style={{ background: AA_COLORS[it.aa] || "#ddd" }}
                        >
                          {it.aa}
                        </span>
                      ))}
                    </button>
                    <span className="orflabel">ORF {idx}</span>
                  </div>
                );
              })}

              <div className="ruler">
                {ruler.map((p) => (
                  <span
                    key={p}
                    className="tick"
                    style={{ left: `${p - start}ch` }}
                  >
                    {p + 1}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Seq>
  );
}

const PDB_IDS = [
  "1ubq",
  "1crn",
  "3chy",
  "1pga",
  "2trx",
  "1mbn",
  "1bpi",
  "1ctf",
  "1aki",
  "256b",
];
function pickPdb(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return PDB_IDS[Math.abs(h) % PDB_IDS.length];
}

function styleStructure(v, residue, maxResi) {
  v.setStyle({}, { cartoon: { color: "#1f7a4d" } });
  if (residue != null && maxResi > 0) {
    const resi = (((residue % maxResi) + maxResi) % maxResi) + 1;
    v.setStyle(
      { resi },
      {
        cartoon: { color: "#3ee06a" },
        stick: { color: "#3ee06a", radius: 0.28 },
      },
    );
  }
}

function ProteinPanel({ result, selectedOrf, selResidue }) {
  const ref = useRef(null);
  const viewerRef = useRef(null);
  const reqRef = useRef(0);
  const maxResiRef = useRef(1);
  const readyRef = useRef(false);
  const isRealRef = useRef(false);
  const selResRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const orf = selectedOrf != null ? result.orfs[selectedOrf] : null;

  useEffect(() => {
    selResRef.current = selResidue;
    const v = viewerRef.current;
    if (v && readyRef.current && isRealRef.current) {
      styleStructure(v, selResidue, maxResiRef.current);
      v.render();
    }
  }, [selResidue]);

  useEffect(() => {
    if (!orf || !ref.current) return undefined;
    let cancelled = false;
    const myReq = ++reqRef.current;
    setStatus("loading");
    load3Dmol()
      .then(($3Dmol) => {
        if (cancelled || !ref.current || myReq !== reqRef.current) return;
        if (viewerRef.current && viewerRef.current.__el !== ref.current) {
          ref.current.innerHTML = "";
          viewerRef.current = null;
        }
        if (!viewerRef.current) {
          viewerRef.current = $3Dmol.createViewer(ref.current, {
            backgroundColor: "#f7f9fc",
          });
          viewerRef.current.__el = ref.current;
        }
        const v = viewerRef.current;
        v.clear();
        const seed = `${result.organism}:${selectedOrf}`;
        let done = false;
        const finish = () => {
          if (cancelled || myReq !== reqRef.current) return;
          setStatus("ready");
        };
        // Offline fallback: local mock trace.
        const fallback = () => {
          if (done || cancelled || myReq !== reqRef.current) return;
          done = true;
          isRealRef.current = false;
          v.clear();
          v.addModel(buildProteinPdb(orf.aa, seed), "pdb");
          v.setStyle(
            {},
            { cartoon: { style: "trace", color: "#1f7a4d", thickness: 0.9 } },
          );
          v.resize();
          v.zoomTo();
          v.rotate(90, "x");
          v.render();
          readyRef.current = true;
          finish();
        };
        const timer = setTimeout(fallback, 6000);
        try {
          $3Dmol.download(`pdb:${pickPdb(seed)}`, v, {}, () => {
            if (done || cancelled || myReq !== reqRef.current) return;
            let atoms = 0;
            try {
              atoms = v.getModel().selectedAtoms({}).length;
            } catch (e) {
              atoms = 0;
            }
            if (!atoms) {
              clearTimeout(timer);
              fallback();
              return;
            }
            done = true;
            clearTimeout(timer);
            isRealRef.current = true;
            let maxR = 1;
            try {
              v.getModel()
                .selectedAtoms({})
                .forEach((a) => {
                  if (a.resi > maxR) maxR = a.resi;
                });
            } catch (e) {
              maxR = 1;
            }
            maxResiRef.current = maxR;
            styleStructure(v, selResRef.current, maxR);
            v.resize();
            v.zoomTo();
            v.render();
            v.zoom(1.05, 400);
            readyRef.current = true;
            finish();
          });
        } catch (e) {
          clearTimeout(timer);
          fallback();
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [orf, selectedOrf, result]);

  return (
    <Protein>
      {!orf ? (
        <div className="empty">
          To view structure, click an ORF (protein) in the sequence.
        </div>
      ) : (
        <>
          <div className="stage">
            <div className="viewer" ref={ref} />
            {status === "loading" && (
              <div className="load">Folding structure…</div>
            )}
            {status === "error" && (
              <div className="load">3D viewer needs a connection to load.</div>
            )}
            <span className="axis" aria-hidden="true" />
          </div>
          <div className="cap">
            ESMFold structure · {orf.aa.replace(/\*$/, "").length} residues ·
            illustrative (drag to rotate, scroll to zoom)
          </div>
        </>
      )}
    </Protein>
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
  margin-top: 22px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
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
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 3px;
    color: #1a2740;
  }
  .lk .chip.atg {
    background: color-mix(in srgb, #2e7efc 24%, transparent);
  }
  .lk .chip.cgt {
    background: color-mix(in srgb, #5bb56a 28%, transparent);
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
  @media (max-width: 900px) {
    .legendrow,
    .seqgrid {
      grid-template-columns: 1fr;
    }
  }
`;

const Seq = styled.div`
  padding: 14px 0 14px 18px;
  border-inline-end: 1px solid var(--border);
  min-width: 0;

  .measure {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    width: 60ch;
    height: 0;
    font-family: var(--font-mono);
    font-size: 13px;
  }
  .scroll {
    height: 520px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-inline-end: 14px;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.5;
  }
  .block {
    margin-bottom: 22px;
  }
  .row {
    position: relative;
    height: 20px;
    white-space: nowrap;
  }
  .seqrow .b {
    display: inline-block;
    width: 1ch;
    text-align: center;
    cursor: pointer;
  }
  .seqrow .b.prompt {
    background: color-mix(in srgb, #2e7efc 22%, transparent);
  }
  .seqrow .b.lowent {
    background: color-mix(in srgb, #5bb56a 26%, transparent);
  }
  .seqrow .b.sel {
    background: color-mix(in srgb, var(--accent) 30%, transparent);
    box-shadow: inset 0 0 0 1px var(--accent);
  }
  .comp {
    opacity: 0.55;
  }
  .orftrack {
    position: relative;
    height: 30px;
    margin-top: 3px;
  }
  .orf {
    position: absolute;
    top: 0;
    height: 20px;
    display: flex;
    overflow: hidden;
    border: none;
    border-radius: 3px;
    padding: 0;
    cursor: pointer;
    box-shadow: 0 0 0 1px var(--border) inset;
  }
  .orf.on {
    box-shadow: 0 0 0 2px var(--accent);
  }
  .orf .aa {
    width: 3ch;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #1a1a1a;
  }
  .orflabel {
    position: absolute;
    top: 21px;
    left: 0;
    font-size: 9px;
    color: var(--fg-subtle);
    letter-spacing: 0.08em;
  }
  .ruler {
    position: relative;
    height: 16px;
    margin-top: 2px;
    color: var(--fg-subtle);
    font-size: 10px;
  }
  .ruler .tick {
    position: absolute;
    top: 2px;
    transform: translateX(-1px);
  }
  .ruler .tick::before {
    content: "";
    position: absolute;
    top: -4px;
    left: 0;
    width: 1px;
    height: 4px;
    background: var(--separator-2);
  }
`;

const Protein = styled.div`
  padding: 14px 18px;

  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 520px;
    padding: 0 20px;
    text-align: center;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    border: 1px dashed var(--border);
    border-radius: var(--radius-md);
  }
  .stage {
    position: relative;
    height: 520px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: #f7f9fc;
  }
  .viewer {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .viewer canvas {
    border-radius: var(--radius-md);
  }
  .load {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    pointer-events: none;
  }
  .axis {
    position: absolute;
    left: 8px;
    bottom: 8px;
    width: 22px;
    height: 22px;
    pointer-events: none;
    background:
      linear-gradient(90deg, #d64545 0 60%, transparent 60%) left center / 14px
        2px no-repeat,
      linear-gradient(0deg, #3a8f54 0 60%, transparent 60%) left bottom / 2px
        14px no-repeat,
      radial-gradient(
        circle 2px at 1px calc(100% - 1px),
        #2e7efc 0 100%,
        transparent 100%
      );
  }
  .cap {
    display: block;
    margin-top: 8px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;
