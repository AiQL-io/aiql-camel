"use client";

import React, { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import {
  GENOMES,
  CONCEPTS,
  conceptTracks,
  featureDetails,
  bpAt,
} from "@/imports/genetics/data/evoMock.js";

const BINS = 240;
const VW = 1000; // svg viewBox width

export function MechInterpVisualizer() {
  const [genome, setGenome] = useState(GENOMES[0].id);
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(CONCEPTS.map((c) => [c.key, true])),
  );
  const [view, setView] = useState({ start: BINS * 0.45, end: BINS * 0.72 });
  const [opts, setOpts] = useState({
    centerLine: true,
    trackLabels: true,
    crosshair: true,
  });
  const [hover, setHover] = useState(null); // { x, bp }
  const [popover, setPopover] = useState(null); // { x, y, details }

  const trackRef = useRef(null);
  const browserRef = useRef(null);
  const dragRef = useRef(null);
  const movedRef = useRef(false);

  const genomeObj = GENOMES.find((g) => g.id === genome);
  const kbPerBin = genomeObj.kb / BINS;

  const tracks = useMemo(
    () =>
      CONCEPTS.map((c) => ({
        concept: c,
        data: conceptTracks(genome, c, BINS),
      })),
    [genome],
  );

  const activeConcepts = CONCEPTS.filter((c) => checked[c.key]);
  const toggle = (key) => setChecked((s) => ({ ...s, [key]: !s[key] }));
  const toggleOpt = (key) => setOpts((s) => ({ ...s, [key]: !s[key] }));

  const xOf = (bin) => ((bin - view.start) / (view.end - view.start)) * VW;
  const binAtClientX = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return view.start;
    const f = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return view.start + f * (view.end - view.start);
  };

  const zoom = (factor) => {
    setView((v) => {
      const mid = (v.start + v.end) / 2;
      let half = ((v.end - v.start) / 2) * factor;
      half = Math.max(4, Math.min(BINS / 2, half));
      return {
        start: Math.max(0, mid - half),
        end: Math.min(BINS, mid + half),
      };
    });
  };

  const onDown = (e) => {
    dragRef.current = {
      x: e.clientX,
      start: view.start,
      end: view.end,
      w: trackRef.current?.getBoundingClientRect().width || 1,
    };
    movedRef.current = false;
  };
  const onMove = (e) => {
    // crosshair hover
    if (opts.crosshair && trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 0 && x <= rect.width) {
        setHover({
          x,
          y,
          bp: Math.round(binAtClientX(e.clientX) * kbPerBin * 1000),
        });
      }
    }
    // pan
    const d = dragRef.current;
    if (d) {
      if (Math.abs(e.clientX - d.x) > 3) movedRef.current = true;
      const span = d.end - d.start;
      const deltaBin = ((e.clientX - d.x) / d.w) * span;
      let start = d.start - deltaBin;
      let end = d.end - deltaBin;
      if (start < 0) {
        end -= start;
        start = 0;
      }
      if (end > BINS) {
        start -= end - BINS;
        end = BINS;
      }
      setView({ start: Math.max(0, start), end: Math.min(BINS, end) });
    }
  };
  const onUp = () => {
    dragRef.current = null;
  };
  const onLeave = () => {
    dragRef.current = null;
    setHover(null);
  };

  const trackGeom = () => {
    const brect = browserRef.current?.getBoundingClientRect();
    const trect = trackRef.current?.getBoundingClientRect();
    return {
      trackLeft: (trect?.left || 0) - (brect?.left || 0),
      trackWidth: trect?.width || 1,
      brectTop: brect?.top || 0,
      browserWidth: brect?.width || 1,
      browserHeight: brect?.height || 1,
    };
  };

  const openFeature = (concept, bin, e) => {
    if (movedRef.current) return; // was a drag, not a click
    const details = featureDetails(genomeObj, concept, Math.round(bin), BINS);
    const g = trackGeom();
    setPopover({
      kind: "feature",
      bin,
      y: e.clientY - g.brectTop,
      trackLeft: g.trackLeft,
      trackWidth: g.trackWidth,
      browserWidth: g.browserWidth,
      browserHeight: g.browserHeight,
      details,
      color: concept.color,
    });
  };

  const openSignalValues = (concept, data, e) => {
    if (movedRef.current) return;
    const binF = binAtClientX(e.clientX);
    const bin = Math.max(0, Math.min(BINS - 1, Math.round(binF)));
    const baseVal = data.signal[bin] ?? 0.3;
    const bp = Math.round(binF * kbPerBin * 1000);
    const WIN = 563;
    const start0 = Math.max(0, Math.round((bp - 3 * WIN) / WIN) * WIN);
    const rows = [];
    for (let i = 0; i < 7; i++) {
      const s = start0 + i * WIN;
      const wob = Math.sin(s * 0.013) * 0.018;
      const v = Math.max(0.05, Math.min(0.99, 0.27 + baseVal * 0.09 + wob));
      rows.push({
        position: `${s.toLocaleString()}-${(s + WIN - 1).toLocaleString()}`,
        value: v.toFixed(4),
      });
    }
    const g = trackGeom();
    setPopover({
      kind: "values",
      bin: binF,
      y: e.clientY - g.brectTop,
      trackLeft: g.trackLeft,
      trackWidth: g.trackWidth,
      browserWidth: g.browserWidth,
      browserHeight: g.browserHeight,
      rows,
      color: concept.color,
    });
  };

  const kbTicks = [];
  const tickN = 8;
  for (let i = 0; i <= tickN; i++) {
    const bin = view.start + ((view.end - view.start) * i) / tickN;
    kbTicks.push({ x: (i / tickN) * VW, kb: Math.round(bin * kbPerBin) });
  }

  const binRange = [];
  for (let b = Math.floor(view.start); b <= Math.ceil(view.end); b++) {
    if (b >= 0 && b < BINS) binRange.push(b);
  }

  const buildExportSvg = () => {
    const rulerH = 28;
    const blockH = 86;
    const PLOT = 46;
    const W = VW;
    const H = rulerH + activeConcepts.length * blockH + 12;
    const esc = (s) =>
      String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    const tickW = Math.max(1.4, W / Math.max(1, binRange.length) / 1.6).toFixed(
      1,
    );
    const parts = [
      `<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`,
    ];
    kbTicks.forEach((t) => {
      parts.push(
        `<line x1="${t.x}" y1="${rulerH - 8}" x2="${t.x}" y2="${rulerH}" stroke="#cbd5e1" stroke-width="0.6"/>`,
        `<text x="${t.x + 3}" y="${rulerH - 11}" font-size="10" fill="#64748b" font-family="monospace">${t.kb.toLocaleString()} kb</text>`,
      );
    });
    activeConcepts.forEach((c, idx) => {
      const data = tracks.find((t) => t.concept.key === c.key).data;
      const y0 = rulerH + idx * blockH + 8;
      const pts = binRange.map(
        (b) =>
          `${xOf(b).toFixed(1)},${(y0 + PLOT - data.signal[b] * PLOT).toFixed(1)}`,
      );
      const area =
        binRange.length > 1
          ? `M ${xOf(binRange[0]).toFixed(1)},${y0 + PLOT} L ${pts.join(" L ")} L ${xOf(
              binRange[binRange.length - 1],
            ).toFixed(1)},${y0 + PLOT} Z`
          : "";
      parts.push(
        `<path d="${area}" fill="${c.color}" fill-opacity="0.32" stroke="${c.color}" stroke-width="0.8"/>`,
        `<text x="6" y="${y0 + 12}" font-size="11" fill="#334155" font-family="monospace">${esc(c.feature)}-activations</text>`,
      );
      const annoY = y0 + PLOT + 8;
      data.hits
        .filter((h) => h >= binRange[0] && h <= binRange[binRange.length - 1])
        .forEach((h) => {
          parts.push(
            `<rect x="${xOf(h).toFixed(1)}" y="${annoY}" width="${tickW}" height="12" fill="${c.color}" opacity="0.85"/>`,
          );
        });
      parts.push(
        `<text x="6" y="${annoY + 10}" font-size="10" fill="#475569" font-family="monospace">${esc(c.label)}</text>`,
      );
    });
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${parts.join("")}</svg>`,
      W,
      H,
    };
  };

  const saveImage = () => {
    const { svg, W, H } = buildExportSvg();
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const purl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = purl;
        a.download = `evo-igv-${genome}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(purl);
      }, "image/png");
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };

  return (
    <Root>
      <aside className="side">
        <label className="genomelbl">Genome</label>
        <div className="genomesel">
          <Select
            options={GENOMES.map((g) => ({ value: g.id, label: g.label }))}
            value={genome}
            onChange={setGenome}
            size="sm"
            block
          />
        </div>

        <h4>Highlighted features</h4>
        <p className="desc">
          Features are patterns of neural-network activity that show how Evo 2
          &lsquo;thinks&rsquo; when generating DNA. Toggle a concept to see its
          feature activations along the genome.
        </p>

        <div className="concepts">
          <div className="ch head">
            <span>Genomic concept</span>
            <span>Feature · F1</span>
          </div>
          {CONCEPTS.map((c) => (
            <label key={c.key} className="ch">
              <input
                type="checkbox"
                checked={!!checked[c.key]}
                onChange={() => toggle(c.key)}
              />
              <span className="cname" style={{ color: c.color }}>
                {c.label}
              </span>
              <span className="cfeat">
                {c.feature} · {c.f1}
              </span>
            </label>
          ))}
        </div>
      </aside>

      <div className="browser" ref={browserRef}>
        <div className="toolbar">
          <span className="igv">IGV</span>
          <span className="loc">{genome}</span>
          <span className="span">
            {Math.round((view.end - view.start) * kbPerBin)} kb
          </span>
          <div className="tools">
            <button
              type="button"
              className={opts.crosshair ? "on" : ""}
              onClick={() => toggleOpt("crosshair")}
            >
              Crosshairs
            </button>
            <button
              type="button"
              className={opts.centerLine ? "on" : ""}
              onClick={() => toggleOpt("centerLine")}
            >
              Center Line
            </button>
            <button
              type="button"
              className={opts.trackLabels ? "on" : ""}
              onClick={() => toggleOpt("trackLabels")}
            >
              Track Labels
            </button>
            <button type="button" onClick={saveImage}>
              Save Image
            </button>
            <button type="button" className="zb" onClick={() => zoom(1.6)}>
              <Icon name="minus" size={13} />
            </button>
            <button type="button" className="zb" onClick={() => zoom(0.625)}>
              <Icon name="plus" size={13} />
            </button>
          </div>
        </div>

        <div className="ideo">
          <div
            className="window"
            style={{
              insetInlineStart: `${(view.start / BINS) * 100}%`,
              width: `${((view.end - view.start) / BINS) * 100}%`,
            }}
          />
        </div>

        <div className="ruler">
          {hover && opts.crosshair && (
            <span className="bpbox" style={{ insetInlineStart: hover.x }}>
              {hover.bp.toLocaleString()}
            </span>
          )}
          <svg viewBox={`0 0 ${VW} 20`} preserveAspectRatio="none">
            {kbTicks.map((t, i) => (
              <g key={i}>
                <line
                  x1={t.x}
                  x2={t.x}
                  y1={12}
                  y2={20}
                  stroke="var(--separator-2)"
                  strokeWidth={0.6}
                />
                <text x={t.x + 3} y={10} fontSize={9} fill="var(--fg-subtle)">
                  {t.kb.toLocaleString()} kb
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div
          className="tracks"
          ref={trackRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onLeave}
        >
          {activeConcepts.length === 0 && (
            <div className="empty">
              Select one or more concepts to show tracks.
            </div>
          )}
          {activeConcepts.map((c) => {
            const data = tracks.find((t) => t.concept.key === c.key).data;
            return (
              <ConceptTrack
                key={c.key}
                concept={c}
                data={data}
                binRange={binRange}
                xOf={xOf}
                showLabels={opts.trackLabels}
                onFeatureClick={openFeature}
                onSignalClick={openSignalValues}
              />
            );
          })}

          {opts.centerLine && <div className="centerline" />}
          {opts.crosshair && hover && (
            <>
              <div
                className="crosshair"
                style={{ insetInlineStart: hover.x }}
              />
              <div className="crosshair-h" style={{ top: hover.y }} />
            </>
          )}
        </div>

        {popover &&
          popover.bin >= view.start &&
          popover.bin <= view.end &&
          (() => {
            const px =
              popover.trackLeft +
              ((popover.bin - view.start) / (view.end - view.start)) *
                popover.trackWidth;
            const flip = px + 320 > popover.browserWidth;
            const popH = popover.kind === "values" ? 300 : 240;
            const py = Math.max(
              6,
              Math.min(popover.y, popover.browserHeight - popH),
            );
            return (
              <FeaturePopover
                popover={popover}
                x={px}
                y={py}
                flip={flip}
                onClose={() => setPopover(null)}
              />
            );
          })()}
      </div>
    </Root>
  );
}

function ConceptTrack({
  concept,
  data,
  binRange,
  xOf,
  showLabels,
  onFeatureClick,
  onSignalClick,
}) {
  const PLOT = 46;
  const pts = binRange.map((b) => `${xOf(b)},${PLOT - data.signal[b] * PLOT}`);
  const areaPath =
    binRange.length > 1
      ? `M ${xOf(binRange[0])},${PLOT} L ${pts.join(" L ")} L ${xOf(
          binRange[binRange.length - 1],
        )},${PLOT} Z`
      : "";

  const hitsInView = data.hits.filter(
    (h) => h >= binRange[0] && h <= binRange[binRange.length - 1],
  );

  return (
    <div className="ctrack">
      <div className="scale" style={{ color: concept.color }}>
        {data.peak}
        <span>0</span>
      </div>
      <div className="plotwrap">
        {showLabels && (
          <span className="tlabel" style={{ borderColor: concept.color }}>
            {concept.feature}-activations
          </span>
        )}
        <svg
          className="sig"
          viewBox={`0 0 ${VW} ${PLOT}`}
          preserveAspectRatio="none"
        >
          <rect
            x={0}
            y={0}
            width={VW}
            height={PLOT}
            fill="transparent"
            style={{ cursor: "crosshair" }}
            onClick={(e) => onSignalClick(concept, data, e)}
          />
          <path
            d={areaPath}
            fill={concept.color}
            fillOpacity={0.32}
            stroke={concept.color}
            strokeWidth={0.8}
            style={{ pointerEvents: "none" }}
          />
        </svg>

        {showLabels && (
          <span className="tlabel anno" style={{ borderColor: concept.color }}>
            {concept.label}
          </span>
        )}
        <svg
          className="anno"
          viewBox={`0 0 ${VW} 16`}
          preserveAspectRatio="none"
        >
          {hitsInView.map((h, i) => (
            <g key={i}>
              <rect
                x={xOf(h)}
                y={2}
                width={Math.max(1.4, VW / binRange.length / 1.6)}
                height={12}
                fill={concept.color}
                opacity={0.85}
              />
              {/* wider transparent hit target for clicking */}
              <rect
                x={xOf(h) - 9}
                y={0}
                width={18}
                height={16}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onClick={(e) => onFeatureClick(concept, h, e)}
              />
            </g>
          ))}
        </svg>
        {showLabels && data.labels && (
          <div className="annolabels">
            {hitsInView.slice(0, data.labels.length).map((h, i) => (
              <span
                key={i}
                style={{ insetInlineStart: `${(xOf(h) / VW) * 100}%` }}
              >
                {data.labels[i % data.labels.length]}
              </span>
            ))}
          </div>
        )}
      </div>
      <Icon name="gear-six" size={13} className="gear" />
    </div>
  );
}

function FeaturePopover({ popover, x, y, flip, onClose }) {
  const { kind } = popover;
  return (
    <Pop
      className={flip ? "flip" : ""}
      style={{
        insetInlineStart: x,
        top: y,
        borderColor: popover.color || "var(--accent)",
        transform: flip
          ? "translate(calc(-100% - 12px), 0)"
          : "translate(12px, 0)",
      }}
      role="dialog"
    >
      <span
        className="anchor"
        style={{ background: popover.color || "var(--accent)" }}
      />
      <button
        type="button"
        className="close"
        onClick={onClose}
        aria-label="Close"
      >
        <Icon name="x" size={13} />
      </button>
      {kind === "values" ? (
        <div className="values">
          {popover.rows.map((r, i) => (
            <div className="vrow" key={i}>
              <div>
                <b>Position:</b> {r.position}
              </div>
              <div>
                <b>Value:</b> {r.value}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table>
          <tbody>
            {[
              ["Name", popover.details.name],
              ["Type", popover.details.type],
              ["Source", popover.details.source],
              ["Phase", String(popover.details.phase)],
              ["locus_tag", popover.details.locusTag],
              ["product", popover.details.product],
              ["Dbxref", popover.details.dbxref],
              ["gene", popover.details.gene],
              ["Location", popover.details.location],
            ].map(([k, v]) => (
              <tr key={k}>
                <th>{k}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Pop>
  );
}

const Pop = styled.div`
  position: absolute;
  z-index: 20;
  transform: translate(12px, -8px);
  width: max-content;
  max-width: 380px;
  max-height: 320px;
  overflow-y: auto;
  padding: 12px 14px 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-inline-start: 3px solid var(--accent);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-popover);

  .anchor {
    position: absolute;
    inset-inline-start: -5px;
    top: 10px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--surface);
  }
  &.flip .anchor {
    inset-inline-start: auto;
    inset-inline-end: -5px;
  }
  .values {
    display: flex;
    flex-direction: column;
  }
  .vrow {
    padding: 6px 0;
    font-size: var(--text-xs);
    color: var(--fg);
    border-bottom: 1px solid var(--separator);
    white-space: nowrap;
  }
  .vrow:last-child {
    border-bottom: none;
  }
  .vrow b {
    color: var(--fg-subtle);
    font-weight: var(--weight-medium);
  }

  .close {
    position: absolute;
    top: 6px;
    inset-inline-end: 6px;
    border: none;
    background: transparent;
    color: var(--fg-subtle);
    cursor: pointer;
    padding: 2px;
  }
  .close:hover {
    color: var(--fg);
  }
  table {
    border-collapse: collapse;
    font-size: var(--text-xs);
  }
  th {
    text-align: start;
    vertical-align: top;
    padding: 2px 12px 2px 0;
    color: var(--fg-subtle);
    font-weight: var(--weight-medium);
    white-space: nowrap;
  }
  td {
    padding: 2px 18px 2px 0;
    color: var(--fg);
    font-family: var(--font-mono);
    word-break: break-word;
  }
`;

const Root = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  overflow: hidden;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  .side {
    padding: 16px;
    border-inline-end: 1px solid var(--border);
    background: var(--surface-2);
  }
  .genomelbl {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .genomesel {
    margin-top: 6px;
  }
  .genomesel button {
    background: var(--surface-3);
  }
  .side h4 {
    margin-top: 18px;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .desc {
    margin-top: 6px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    line-height: 1.5;
  }
  .concepts {
    margin-top: 14px;
  }
  .ch {
    display: grid;
    grid-template-columns: 16px 1fr auto;
    align-items: center;
    gap: 8px;
    padding: 5px 0;
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .ch.head {
    grid-template-columns: 1fr auto;
    color: var(--fg-subtle);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 10px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 6px;
    margin-bottom: 4px;
    cursor: default;
  }
  .cname {
    font-weight: var(--weight-medium);
  }
  .cfeat {
    font-family: var(--font-mono);
    color: var(--fg-subtle);
  }

  .browser {
    position: relative;
    min-width: 0;
    padding: 12px 14px 16px;
  }
  .toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-muted, var(--surface-2));
    flex-wrap: wrap;
  }
  .igv {
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--fg);
  }
  .loc {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .span {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .tools {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-inline-start: auto;
  }
  .tools button {
    height: 24px;
    padding: 0 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--fg-secondary);
    font-size: 11px;
    cursor: pointer;
  }
  .tools button.on {
    border-color: var(--accent);
    color: var(--accent);
  }
  .tools .zb {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    padding: 0;
  }

  .ideo {
    position: relative;
    height: 14px;
    margin-top: 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface-2);
    overflow: hidden;
  }
  .ideo .window {
    position: absolute;
    top: -1px;
    bottom: -1px;
    border: 1.5px solid var(--danger);
    border-radius: var(--radius-pill);
    background: color-mix(in srgb, var(--danger) 10%, transparent);
  }
  .ruler {
    position: relative;
    margin-top: 6px;
    height: 20px;
  }
  .ruler svg {
    width: 100%;
    height: 20px;
    display: block;
  }
  .bpbox {
    position: absolute;
    top: -2px;
    transform: translateX(-50%);
    z-index: 4;
    padding: 1px 5px;
    background: var(--fg);
    color: var(--bg);
    font-family: var(--font-mono);
    font-size: 10px;
    border-radius: 3px;
    white-space: nowrap;
    pointer-events: none;
  }

  .tracks {
    position: relative;
    margin-top: 4px;
    cursor: grab;
    touch-action: none;
  }
  .tracks:active {
    cursor: grabbing;
  }
  .empty {
    padding: 40px;
    text-align: center;
    color: var(--fg-subtle);
    font-size: var(--text-sm);
  }
  .centerline {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 0;
    border-inline-start: 1px dashed var(--fg-muted);
    pointer-events: none;
  }
  .crosshair {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    border-inline-start: 1px dashed var(--accent);
    pointer-events: none;
    z-index: 3;
  }
  .crosshair-h {
    position: absolute;
    left: 0;
    right: 0;
    height: 0;
    border-top: 1px dashed var(--accent);
    pointer-events: none;
    z-index: 3;
  }

  .ctrack {
    display: grid;
    grid-template-columns: 34px 1fr 18px;
    gap: 6px;
    align-items: stretch;
    padding: 8px 0;
    border-bottom: 1px solid var(--separator);
  }
  .scale {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 9px;
    text-align: end;
    padding-top: 2px;
  }
  .scale span {
    color: var(--fg-subtle);
  }
  .plotwrap {
    position: relative;
    min-width: 0;
    padding-bottom: 14px;
  }
  .tlabel {
    position: absolute;
    inset-inline-start: 2px;
    top: 0;
    z-index: 2;
    padding: 1px 6px;
    background: var(--surface);
    border: 1px solid;
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--fg-secondary);
  }
  .tlabel.anno {
    top: 50px;
  }
  svg.sig {
    width: 100%;
    height: 46px;
    display: block;
  }
  svg.anno {
    width: 100%;
    height: 16px;
    display: block;
    margin-top: 4px;
  }
  .annolabels {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 12px;
  }
  .annolabels span {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    font-size: 8px;
    color: var(--fg-subtle);
    white-space: nowrap;
  }
  .gear {
    color: var(--fg-disabled);
    align-self: flex-start;
    margin-top: 2px;
  }
`;
