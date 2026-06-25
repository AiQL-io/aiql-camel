"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { complement, AA_COLORS } from "@/imports/genetics/data/evoMock.js";

export function SequenceViewer({
  result,
  selectedOrf,
  selection,
  showPrompt,
  showLowEnt,
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
  const [colW, setColW] = useState(7.8);

  useEffect(() => {
    const compute = () => {
      const sc = scrollRef.current;
      const ms = measureRef.current;
      if (!sc || !ms) return;
      const chW = ms.getBoundingClientRect().width / 60;
      const avail = sc.clientWidth - 18;
      if (chW > 0 && avail > 0) {
        setColW(chW);
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
      <div className="scroll" ref={scrollRef} style={{ "--colw": `${colW}px` }}>
        {starts.map((start) => {
          const end = Math.min(start + lineLen, bases.length);
          const seg = bases.slice(start, end).split("");
          const cseg = comp.slice(start, end).split("");
          const lineOrfs = orfs
            .map((o, idx) => ({ o, idx }))
            .filter(({ o }) => o.start < end && o.end > start);

          const ruler = [];
          if (start === 0) ruler.push(0);
          for (let p = start; p < end; p++) {
            if ((p + 1) % 10 === 0) ruler.push(p);
          }

          return (
            <div className="block" key={start}>
              <div className="row seqrow">
                {seg.map((b, j) => {
                  const gi = start + j;
                  const isPrompt = showPrompt && gi < promptLen;
                  const low =
                    showLowEnt &&
                    gi >= promptLen &&
                    entropy[gi] <= lowEntropyThreshold;
                  const isSel = gi >= selLo && gi < selHi;
                  return (
                    <span
                      key={j}
                      className={`b${isSel ? " sel" : isPrompt ? " prompt" : low ? " lowent" : ""}`}
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
                  const isPrompt = showPrompt && gi < promptLen;
                  const low =
                    showLowEnt &&
                    gi >= promptLen &&
                    entropy[gi] <= lowEntropyThreshold;
                  const isSel = gi >= selLo && gi < selHi;
                  return (
                    <span
                      key={j}
                      className={`b${isSel ? " sel" : isPrompt ? " prompt" : low ? " lowent" : ""}`}
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
                const barLeft = items[0].offset;
                const barW = items[items.length - 1].offset + 3 - barLeft;
                return (
                  <div
                    className="orftrack"
                    key={idx}
                    style={{ width: `calc(var(--colw) * ${end - start})` }}
                  >
                    <button
                      type="button"
                      className={`orf${selectedOrf === idx ? " on" : ""}`}
                      style={{ left: `calc(var(--colw) * ${barLeft})` }}
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
                    <span
                      className="proteinbar"
                      style={{
                        left: `calc(var(--colw) * ${barLeft})`,
                        width: `calc(var(--colw) * ${barW})`,
                      }}
                      onClick={() => onSelectOrf(idx)}
                    />
                    <span
                      className="orflabel"
                      style={{ left: `calc(var(--colw) * ${barLeft})` }}
                    >
                      ORF {idx}
                    </span>
                  </div>
                );
              })}

              <div className="ruler">
                {ruler.map((p) => (
                  <span
                    key={p}
                    className="tick"
                    style={{ left: `calc(var(--colw) * ${p - start + 0.5})` }}
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
    margin-bottom: 30px;
  }
  .row {
    position: relative;
    height: 20px;
    white-space: nowrap;
  }
  .seqrow .b {
    width: var(--colw, 1ch);
    text-align: center;
    color: #0f172a;
    cursor: pointer;
  }
  .seqrow .b.prompt {
    background: #dbeafe;
  }
  .seqrow .b.lowent {
    background: rgba(0, 255, 0, 0.5);
  }
  .seqrow .b.sel {
    background: color-mix(in srgb, var(--accent) 30%, transparent);
    box-shadow: inset 0 0 0 1px var(--accent);
  }
  .comp {
    opacity: 1;
  }
  .orftrack {
    position: relative;
    height: 38px;
    margin-top: 8px;
    overflow: hidden;
  }
  .orf {
    position: absolute;
    top: 0;
    height: 18px;
    display: flex;
    border: none;
    padding: 0;
    background: transparent;
    cursor: pointer;
    filter: drop-shadow(0 0 0.4px rgba(20, 30, 50, 0.45));
  }
  .orf .aa {
    width: calc(3ch + 6px);
    margin-inline-end: -6px;
    padding-inline-end: 6px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    color: #2a3346;
    clip-path: polygon(
      0 0,
      calc(100% - 6px) 0,
      100% 50%,
      calc(100% - 6px) 100%,
      0 100%,
      6px 50%
    );
  }
  .orf .aa:first-child {
    clip-path: polygon(
      0 0,
      calc(100% - 6px) 0,
      100% 50%,
      calc(100% - 6px) 100%,
      0 100%
    );
  }
  .orf .aa:last-child {
    margin-inline-end: 0;
  }
  .orf.on {
    filter: drop-shadow(0 0 0.6px var(--accent));
  }
  .orf.on .aa {
    filter: saturate(1.35) brightness(0.95);
  }
  .proteinbar {
    position: absolute;
    top: 22px;
    height: 12px;
    border-radius: 0;
    background: #ddd6fe;
    cursor: pointer;
  }
  .orflabel {
    position: absolute;
    top: 22px;
    font-size: 9px;
    line-height: 12px;
    padding-inline-start: 4px;
    color: #2a2a2a;
    letter-spacing: 0.04em;
    pointer-events: none;
  }
  .ruler {
    position: relative;
    height: 18px;
    margin-top: 4px;
    color: #73777d;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .ruler .tick {
    position: absolute;
    top: 6px;
    transform: translateX(-50%);
    white-space: nowrap;
  }
  .ruler .tick::before {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 1px;
    width: 1px;
    height: 7px;
    background: #c3ccd9;
  }
`;
