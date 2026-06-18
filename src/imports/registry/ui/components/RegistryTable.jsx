"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";

const VIEW_H = 560;
const OVER = 8;
const CHECK_W = 40;

const COAT = {
  Black: "#1d1d1f",
  White: "#f2f2f2",
  Light: "#d9c7a3",
  Blond: "#d9b96a",
  Mixed: "#9a8c7a",
  Cream: "#ece3cf",
  Brown: "#7a4b27",
  Red: "#9c4528",
};

export const REGISTRY_COLUMNS = [
  { key: "registrationId", label: "Reg. ID", width: "130px" },
  { key: "name", label: "Name", width: "minmax(150px,1.3fr)" },
  { key: "breed", label: "Breed", width: "110px" },
  { key: "coatColor", label: "Colour", width: "104px" },
  { key: "region", label: "Region", width: "128px" },
  { key: "ownerName", label: "Owner", width: "140px" },
  { key: "sex", label: "Sex", width: "60px" },
  { key: "birthYear", label: "Born", width: "60px" },
  { key: "age", label: "Age", width: "60px" },
  { key: "hasDNA", label: "DNA", width: "60px" },
  { key: "parentageStatus", label: "Parentage", width: "116px" },
  { key: "completenessScore", label: "Compl.", width: "84px" },
  { key: "alertCount", label: "Alerts", width: "76px" },
  { key: "status", label: "Status", width: "100px" },
  { key: "updatedAt", label: "Updated", width: "108px" },
];
export const DEFAULT_COLUMN_KEYS = REGISTRY_COLUMNS.map((c) => c.key);
const COLUMN_MAP = Object.fromEntries(REGISTRY_COLUMNS.map((c) => [c.key, c]));

const STATUS_TONE = {
  active: "success",
  deceased: "default",
  exported: "warning",
};
const PARENT_TONE = {
  verified: "success",
  conflict: "danger",
  unknown: "default",
};

const widthPx = (w) => (w.startsWith("minmax") ? 150 : parseInt(w, 10));

function renderCell(key, a) {
  switch (key) {
    case "registrationId":
      return <span className="cell id">{a.registrationId}</span>;
    case "name":
      return (
        <span className="cell name">
          {a.name}
          <i className="ar">{a.nameArabic}</i>
        </span>
      );
    case "breed":
      return <span className="cell muted">{a.breed}</span>;
    case "coatColor":
      return (
        <span className="cell colour">
          <i style={{ background: COAT[a.coatColor] || "#999" }} />
          {a.coatColor}
        </span>
      );
    case "region":
      return <span className="cell muted">{a.region}</span>;
    case "ownerName":
      return <span className="cell muted">{a.ownerName}</span>;
    case "sex":
      return <span className="cell muted cap">{a.sex}</span>;
    case "birthYear":
      return <span className="cell muted">{a.birthYear}</span>;
    case "age":
      return <span className="cell mono">{a.age}y</span>;
    case "hasDNA":
      return (
        <span className="cell">
          <Icon
            name={a.hasDNA ? "check-circle" : "minus-circle"}
            size={15}
            color={a.hasDNA ? "var(--status-success)" : "var(--fg-muted)"}
          />
        </span>
      );
    case "parentageStatus":
      return (
        <span className="cell">
          <Chip
            size="sm"
            tone={PARENT_TONE[a.parentageStatus]}
            style={{ textTransform: "capitalize" }}
          >
            {a.parentageStatus}
          </Chip>
        </span>
      );
    case "completenessScore":
      return (
        <span className="cell mono">
          {Math.round(a.completenessScore * 100)}%
        </span>
      );
    case "alertCount":
      return (
        <span className="cell">
          {a.alertCount > 0 ? (
            <Chip size="sm" tone={a.hasCriticalAlert ? "danger" : "warning"}>
              {a.alertCount}
            </Chip>
          ) : (
            <span className="muted">—</span>
          )}
        </span>
      );
    case "status":
      return (
        <span className="cell">
          <Chip
            size="sm"
            tone={STATUS_TONE[a.status] || "default"}
            style={{ textTransform: "capitalize" }}
          >
            {a.status}
          </Chip>
        </span>
      );
    case "updatedAt":
      return <span className="cell mono">{a.updatedAt}</span>;
    default:
      return <span className="cell" />;
  }
}

export function RegistryTable({
  rows,
  sorts = [],
  toggleSort,
  density = "comfortable",
  selected,
  toggleRow,
  toggleAll,
  onOpen,
  columns = DEFAULT_COLUMN_KEYS,
  pinned = [],
}) {
  const cols = columns.map((k) => COLUMN_MAP[k]).filter(Boolean);
  const template = `${CHECK_W}px ${cols.map((c) => c.width).join(" ")}`;
  const minWidth =
    CHECK_W + 16 + cols.reduce((sum, c) => sum + widthPx(c.width), 0);

  let running = CHECK_W;
  const lefts = {};
  for (const c of cols) {
    if (pinned.includes(c.key)) {
      lefts[c.key] = running;
      running += widthPx(c.width);
    } else break;
  }

  const ROW_H = density === "compact" ? 36 : 44;
  const [scrollTop, setScrollTop] = useState(0);
  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - OVER);
  const end = Math.min(
    rows.length,
    Math.ceil((scrollTop + VIEW_H) / ROW_H) + OVER,
  );
  const visible = rows.slice(start, end);
  const allChecked = rows.length > 0 && selected?.size >= rows.length;

  const sortInfo = (key) => {
    const i = sorts.findIndex((s) => s.key === key);
    return i === -1 ? null : { dir: sorts[i].dir, order: i + 1 };
  };

  return (
    <Wrap>
      <Inner style={{ minWidth }}>
        <Scroller onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
          <Header style={{ gridTemplateColumns: template }}>
            <span className="cell check pin" style={{ left: 0 }}>
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                aria-label="Select all"
              />
            </span>
            {cols.map((c) => {
              const si = sortInfo(c.key);
              const isPin = c.key in lefts;
              return (
                <button
                  key={c.key}
                  type="button"
                  className={isPin ? "pin" : ""}
                  style={isPin ? { left: lefts[c.key] } : undefined}
                  onClick={(e) => toggleSort(c.key, e.shiftKey)}
                  title="Click to sort · Shift-click to add a secondary sort"
                >
                  {c.label}
                  {si && (
                    <span className="arrow">
                      <Icon
                        name={si.dir === "asc" ? "caret-up" : "caret-down"}
                        size={10}
                      />
                      {sorts.length > 1 && <em>{si.order}</em>}
                    </span>
                  )}
                </button>
              );
            })}
          </Header>
          <div style={{ height: rows.length * ROW_H, position: "relative" }}>
            {visible.map((a, i) => (
              <Row
                key={a.id}
                $h={ROW_H}
                $sel={selected?.has(a.id)}
                style={{
                  top: (start + i) * ROW_H,
                  gridTemplateColumns: template,
                }}
                onClick={() => onOpen?.(a)}
              >
                <span
                  className="cell check pin"
                  style={{ left: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selected?.has(a.id) || false}
                    onChange={() => toggleRow?.(a.id)}
                    aria-label={`Select ${a.name}`}
                  />
                </span>
                {cols.map((c) => {
                  const isPin = c.key in lefts;
                  return (
                    <span
                      key={c.key}
                      className={isPin ? "pin-wrap" : ""}
                      style={isPin ? { left: lefts[c.key] } : undefined}
                    >
                      {renderCell(c.key, a)}
                    </span>
                  );
                })}
              </Row>
            ))}
          </div>
        </Scroller>
      </Inner>
    </Wrap>
  );
}

const Wrap = styled.div`
  margin-top: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow-x: auto;
`;

const Inner = styled.div``;

const Header = styled.div`
  display: grid;
  position: sticky;
  top: 0;
  z-index: 3;
  border-bottom: 1px solid var(--border);
  background: var(--bg-muted);

  .check {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pin {
    position: sticky;
    z-index: 4;
    background: var(--bg-muted);
  }
  button {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 40px;
    padding: 0 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
    text-align: start;
  }
  button.pin {
    background: var(--bg-muted);
  }
  button:hover {
    color: var(--fg);
  }
  button .arrow {
    display: inline-flex;
    align-items: center;
    color: var(--accent);
  }
  button .arrow em {
    font-style: normal;
    font-size: 9px;
    margin-inline-start: 1px;
  }
`;

const Scroller = styled.div`
  height: ${VIEW_H}px;
  overflow-y: auto;
  position: relative;
`;

const Row = styled.div`
  position: absolute;
  inset-inline: 0;
  height: ${(p) => p.$h}px;
  display: grid;
  align-items: center;
  border-bottom: 1px solid var(--separator);
  cursor: pointer;
  background: ${(p) => (p.$sel ? "var(--accent-soft)" : "var(--surface)")};

  &:hover {
    background: ${(p) => (p.$sel ? "var(--accent-soft)" : "var(--surface-2)")};
  }
  .pin,
  .pin-wrap {
    position: sticky;
    z-index: 1;
    background: inherit;
    display: flex;
    align-items: center;
  }
  .cell {
    padding: 0 12px;
    font-size: var(--text-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cell.check {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
  .id {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .name {
    font-weight: var(--weight-medium);
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
  .name .ar {
    font-style: normal;
    font-weight: var(--weight-regular);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .muted {
    color: var(--fg-secondary);
  }
  .colour {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--fg-secondary);
  }
  .colour i {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    border: 1px solid var(--border);
    flex: none;
  }
  .cap {
    text-transform: capitalize;
  }
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
`;
