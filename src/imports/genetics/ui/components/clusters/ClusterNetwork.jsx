"use client";

import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function clusterColor(id) {
  return `hsl(${(234 + id * 47) % 360}, 88%, 62%)`;
}

const W = 560;
const H = 460;
const PAD = 24;

export function ClusterNetwork({
  nodes,
  edges,
  selected,
  onSelectCluster,
  onNode,
  onEdge,
}) {
  const [hover, setHover] = useState(null);
  const [view, setView] = useState({ k: 1, tx: 0, ty: 0 });
  const [pan, setPan] = useState(null);
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

  if (!nodes.length)
    return <Empty>No clusters above this threshold in scope.</Empty>;

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const sx = (x) => PAD + ((x - minX) / (maxX - minX || 1)) * (W - 2 * PAD);
  const sy = (y) => PAD + ((y - minY) / (maxY - minY || 1)) * (H - 2 * PAD);
  const vx = (s) => (s - W / 2) * view.k + W / 2 + view.tx;
  const vy = (s) => (s - H / 2) * view.k + H / 2 + view.ty;
  const tsx = (x) => vx(sx(x));
  const tsy = (y) => vy(sy(y));
  const dim = (c) => selected != null && c !== selected;

  const toLocal = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) / rect.width) * W,
      ((e.clientY - rect.top) / rect.height) * H,
    ];
  };
  const onDown = (e) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      setPan(null);
    }
    const [px, py] = toLocal(e);
    setPan({ x: px, y: py, tx0: view.tx, ty0: view.ty, moved: false });
  };
  const onMove = (e) => {
    if (!pan) return;
    const [px, py] = toLocal(e);
    setPan((p) => ({ ...p, moved: true }));
    setView((v) => ({
      ...v,
      tx: pan.tx0 + (px - pan.x),
      ty: pan.ty0 + (py - pan.y),
    }));
  };
  const onUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      void 0;
    }
    setPan(null);
  };
  return (
    <Root>
      <Controls>
        <button
          type="button"
          onClick={() => setView((v) => ({ ...v, k: Math.min(8, v.k * 1.2) }))}
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
        <button
          type="button"
          onClick={() => setView({ k: 1, tx: 0, ty: 0 })}
          title="Reset view"
        >
          <Icon name="arrows-in" size={13} />
        </button>
      </Controls>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: "100%",
          height: "auto",
          touchAction: "none",
          cursor: pan ? "grabbing" : "grab",
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
      >
        <g
          className="aiql-anim-fade"
          style={{ animation: "aiql-fade 600ms ease-out" }}
        >
          {edges.map((e, i) => (
            <line
              key={i}
              x1={tsx(nodes[e.a].x)}
              y1={tsy(nodes[e.a].y)}
              x2={tsx(nodes[e.b].x)}
              y2={tsy(nodes[e.b].y)}
              stroke="var(--fg-muted)"
              strokeWidth={(0.4 + e.r) * Math.min(2, view.k)}
              opacity={dim(e.cluster) ? 0.05 : 0.25}
              style={{ cursor: "pointer" }}
              onClick={() =>
                !(pan && pan.moved) &&
                onEdge &&
                onEdge(nodes[e.a].id, nodes[e.b].id)
              }
            />
          ))}
        </g>
        <g
          className="aiql-anim-fade"
          style={{ animation: "aiql-fade 600ms ease-out 180ms both" }}
        >
          {nodes.map((n, i) => (
            <circle
              key={n.id}
              cx={tsx(n.x)}
              cy={tsy(n.y)}
              r={(3 + n.f * 7) * Math.min(1.8, Math.sqrt(view.k))}
              fill={clusterColor(n.cluster)}
              opacity={dim(n.cluster) ? 0.12 : 0.92}
              stroke={hover === i ? "var(--fg)" : "none"}
              strokeWidth={hover === i ? 1.4 : 0}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => !(pan && pan.moved) && onSelectCluster(n.cluster)}
              onDoubleClick={() => onNode(n.id)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </g>
      </svg>
      {hover != null && (
        <Tip
          style={{
            left: `${(tsx(nodes[hover].x) / W) * 100}%`,
            top: `${(tsy(nodes[hover].y) / H) * 100}%`,
          }}
        >
          <b>{nodes[hover].reg}</b>
          <span>{nodes[hover].name}</span>
          <span>
            {nodes[hover].breed} · F {nodes[hover].f.toFixed(3)}
          </span>
        </Tip>
      )}
      <Hint>
        Drag to pan · scroll to zoom · click a node to isolate its cluster ·
        double-click → profile.
      </Hint>
    </Root>
  );
}

const Root = styled.div`
  position: relative;
  svg {
    display: block;
  }
`;

const Controls = styled.div`
  position: absolute;
  top: 8px;
  inset-inline-end: 8px;
  z-index: 4;
  display: flex;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;

  button {
    border: none;
    background: transparent;
    color: var(--fg-secondary);
    padding: 5px 8px;
    cursor: pointer;
    display: inline-flex;
  }
  button + button {
    border-inline-start: 1px solid var(--border);
  }
  button:hover {
    background: var(--surface-2);
  }
`;

const Tip = styled.div`
  position: absolute;
  transform: translate(10px, -50%);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: 6px 9px;
  pointer-events: none;
  z-index: 5;
  display: flex;
  flex-direction: column;
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
`;

const Hint = styled.p`
  margin-top: 6px;
  font-size: var(--text-xs);
  color: var(--fg-subtle);
`;

const Empty = styled.div`
  padding: 40px;
  text-align: center;
  color: var(--fg-subtle);
  font-size: var(--text-sm);
`;
