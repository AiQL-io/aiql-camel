"use client";

import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { breedColors, PALETTE } from "../palette.js";

const W = 560;
const H = 440;
const PAD = 16;

function fRamp(f) {
  const t = Math.min(1, f / 0.35);
  const r = Math.round(40 + t * 200);
  const g = Math.round(180 - t * 150);
  return `rgb(${r},${g},90)`;
}

export function StructureScatter({
  points,
  breeds,
  regions,
  colorBy = "declared",
  axis = "12",
  threeD = false,
  rot = 0.6,
  hulls = false,
  onSelect,
  onPointClick,
  selectedIds,
}) {
  const bc = breedColors(breeds);
  const rc = {};
  regions.forEach((r, i) => (rc[r] = PALETTE[i % PALETTE.length]));
  const [hover, setHover] = useState(null);
  const [drag, setDrag] = useState(null);
  const [view, setView] = useState({ k: 1, tx: 0, ty: 0 });
  const [pan, setPan] = useState(null);
  const [mode, setMode] = useState("select");
  const svgRef = useRef(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const onWheelNative = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * W;
      const py = ((e.clientY - rect.top) / rect.height) * H;
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      setView((v) => {
        const k = Math.min(8, Math.max(0.5, v.k * factor));
        const ratio = k / v.k;
        return {
          k,
          tx: px - (px - v.tx) * ratio,
          ty: py - (py - v.ty) * ratio,
        };
      });
    };
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", onWheelNative);
  }, []);

  const proj = (p) => {
    if (threeD) {
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const rx = p.x * cos - p.z * sin;
      const rz = p.x * sin + p.z * cos;
      return [rx - rz * 0.18, p.y - rz * 0.42];
    }
    if (axis === "13") return [p.x, p.z];
    if (axis === "23") return [p.y, p.z];
    return [p.x, p.y];
  };
  const projected = points.map((p) => ({ p, c: proj(p) }));
  const xs = projected.map((d) => d.c[0]);
  const ys = projected.map((d) => d.c[1]);
  const minX = Math.min(...xs, -1.5);
  const maxX = Math.max(...xs, 1.5);
  const minY = Math.min(...ys, -1.5);
  const maxY = Math.max(...ys, 1.5);
  const sx = (x) => PAD + ((x - minX) / (maxX - minX || 1)) * (W - 2 * PAD);
  const sy = (y) => H - PAD - ((y - minY) / (maxY - minY || 1)) * (H - 2 * PAD);
  const vx = (s) => (s - W / 2) * view.k + W / 2 + view.tx;
  const vy = (s) => (s - H / 2) * view.k + H / 2 + view.ty;
  const tsx = (x) => vx(sx(x));
  const tsy = (y) => vy(sy(y));

  const hullsByGroup = (() => {
    if (!hulls) return [];
    const keyOf = (p) =>
      colorBy === "genetic"
        ? p.geneticBreed
        : colorBy === "region"
          ? p.region
          : colorBy === "owner"
            ? p.ownerId
            : p.declaredBreed;
    const groups = new Map();
    for (const { p, c } of projected) {
      const key = keyOf(p);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push([tsx(c[0]), tsy(c[1]), p]);
    }
    return [...groups.entries()]
      .filter(([, pts]) => pts.length >= 3)
      .map(([key, pts]) => ({
        key,
        color: colorFor(pts[0][2]),
        poly: convexHull(pts.map((pt) => [pt[0], pt[1]])),
      }))
      .filter((h) => h.poly.length >= 3);
  })();

  const colorFor = (p) => {
    if (colorBy === "genetic") return bc[p.geneticBreed];
    if (colorBy === "region") return rc[p.region] || "var(--fg-muted)";
    if (colorBy === "owner")
      return PALETTE[Math.abs(hashStr(p.ownerId)) % PALETTE.length];
    if (colorBy === "f") return fRamp(p.f);
    return bc[p.declaredBreed];
  };

  const toData = (clientX, clientY, rect) => {
    const px = ((clientX - rect.left) / rect.width) * W;
    const py = ((clientY - rect.top) / rect.height) * H;
    return [px, py];
  };

  const onDown = (e) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      setDrag(null);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const [px, py] = toData(e.clientX, e.clientY, rect);
    if (mode === "pan") {
      setPan({ x: px, y: py, tx0: view.tx, ty0: view.ty });
    } else {
      setDrag({ x0: px, y0: py, x1: px, y1: py });
    }
  };
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const [px, py] = toData(e.clientX, e.clientY, rect);
    if (pan) {
      setView((v) => ({
        ...v,
        tx: pan.tx0 + (px - pan.x),
        ty: pan.ty0 + (py - pan.y),
      }));
      return;
    }
    if (!drag) return;
    setDrag((d) => ({ ...d, x1: px, y1: py }));
  };
  const onUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      void 0;
    }
    if (pan) {
      setPan(null);
      return;
    }
    if (!drag || !onSelect) return setDrag(null);
    const x0 = Math.min(drag.x0, drag.x1);
    const x1 = Math.max(drag.x0, drag.x1);
    const y0 = Math.min(drag.y0, drag.y1);
    const y1 = Math.max(drag.y0, drag.y1);
    if (x1 - x0 < 4 && y1 - y0 < 4) {
      setDrag(null);
      return;
    }
    const ids = projected
      .filter(({ c }) => {
        const px = tsx(c[0]);
        const py = tsy(c[1]);
        return px >= x0 && px <= x1 && py >= y0 && py <= y1;
      })
      .map((d) => d.p.id);
    onSelect(ids);
    setDrag(null);
  };
  const resetView = () => setView({ k: 1, tx: 0, ty: 0 });

  return (
    <Root>
      <Controls>
        <div className="seg">
          <button
            type="button"
            className={mode === "select" ? "on" : ""}
            onClick={() => setMode("select")}
            title="Box-select"
          >
            <Icon name="selection" size={13} /> Select
          </button>
          <button
            type="button"
            className={mode === "pan" ? "on" : ""}
            onClick={() => setMode("pan")}
            title="Pan"
          >
            <Icon name="hand" size={13} /> Pan
          </button>
        </div>
        <div className="seg">
          <button
            type="button"
            onClick={() =>
              setView((v) => ({ ...v, k: Math.min(8, v.k * 1.2) }))
            }
            title="Zoom in"
          >
            <Icon name="plus" size={13} />
          </button>
          <button
            type="button"
            onClick={() =>
              setView((v) => ({ ...v, k: Math.max(0.5, v.k / 1.2) }))
            }
            title="Zoom out"
          >
            <Icon name="minus" size={13} />
          </button>
          <button type="button" onClick={resetView} title="Reset view">
            <Icon name="arrows-in" size={13} />
          </button>
        </div>
      </Controls>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        style={{
          touchAction: "none",
          cursor: mode === "pan" ? "grab" : "crosshair",
        }}
      >
        {hullsByGroup.map((h) => (
          <polygon
            key={`hull-${h.key}`}
            points={h.poly.map((pt) => `${pt[0]},${pt[1]}`).join(" ")}
            fill={h.color}
            fillOpacity={0.08}
            stroke={h.color}
            strokeOpacity={0.5}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        ))}
        {projected.map(({ p, c }) => {
          const isOut = p.outlier;
          const isSel = selectedIds && selectedIds.has(p.id);
          return (
            <circle
              key={p.id}
              cx={tsx(c[0])}
              cy={tsy(c[1])}
              r={
                (isSel ? 4 : isOut ? 3.4 : 2.4) *
                Math.min(1.8, Math.sqrt(view.k))
              }
              fill={colorFor(p)}
              fillOpacity={isSel ? 1 : isOut ? 1 : 0.72}
              stroke={isSel ? "var(--accent)" : isOut ? "var(--fg)" : "none"}
              strokeWidth={isSel ? 1.6 : isOut ? 1 : 0}
              onMouseEnter={() => setHover({ p, cx: tsx(c[0]), cy: tsy(c[1]) })}
              onMouseLeave={() => setHover(null)}
              onClick={() =>
                mode === "select" && onPointClick && onPointClick(p.id)
              }
              style={{ cursor: "pointer" }}
            />
          );
        })}
        {drag && (
          <rect
            x={Math.min(drag.x0, drag.x1)}
            y={Math.min(drag.y0, drag.y1)}
            width={Math.abs(drag.x1 - drag.x0)}
            height={Math.abs(drag.y1 - drag.y0)}
            fill="var(--accent)"
            fillOpacity={0.12}
            stroke="var(--accent)"
            strokeDasharray="4 3"
          />
        )}
      </svg>
      {hover && (
        <Tip
          style={{
            left: `${(hover.cx / W) * 100}%`,
            top: `${(hover.cy / H) * 100}%`,
          }}
        >
          <b>{hover.p.reg}</b>
          <span>{hover.p.name}</span>
          <span>
            Declared: {hover.p.declaredBreed}
            {hover.p.outlier && <em> · genetic: {hover.p.geneticBreed}</em>}
          </span>
          <span>F {hover.p.f.toFixed(3)}</span>
        </Tip>
      )}
      <Hint>
        {mode === "pan"
          ? "Drag to pan · scroll to zoom."
          : "Drag to box-select · scroll to zoom · switch to Pan to move."}
      </Hint>
    </Root>
  );
}

function convexHull(pts) {
  const points = pts
    .map((p) => [p[0], p[1]])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (points.length < 3) return points;
  const cross = (o, a, b) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of points) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    )
      lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    )
      upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < (s || "").length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

const Root = styled.div`
  position: relative;
  svg {
    width: 100%;
    height: auto;
    display: block;
    touch-action: none;
  }
`;

const Controls = styled.div`
  position: absolute;
  top: 8px;
  inset-inline-end: 8px;
  z-index: 4;
  display: flex;
  gap: 6px;

  .seg {
    display: flex;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }
  .seg button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    padding: 5px 8px;
    cursor: pointer;
  }
  .seg button + button {
    border-inline-start: 1px solid var(--border);
  }
  .seg button.on {
    background: var(--accent-soft);
    color: var(--accent);
  }
`;

const Tip = styled.div`
  position: absolute;
  transform: translate(-50%, calc(-100% - 8px));
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: 8px 10px;
  pointer-events: none;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 1px;
  white-space: nowrap;

  b {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  span {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  em {
    color: var(--danger);
    font-style: normal;
  }
`;

const Hint = styled.p`
  margin-top: 6px;
  font-size: var(--text-xs);
  color: var(--fg-subtle);
`;
