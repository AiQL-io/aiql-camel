"use client";

import React from "react";
import { Icon } from "./Icon.jsx";

export function PaletteGroup({
  label,
  items,
  base,
  activeIdx,
  onHover,
  onSelect,
}) {
  if (!items.length) return null;
  return (
    <div className="group">
      <div className="glabel">{label}</div>
      {items.map((it, i) => {
        const myIdx = base + i;
        return (
          <button
            key={`${it.type}-${it.id}`}
            type="button"
            className={myIdx === activeIdx ? "row on" : "row"}
            onMouseEnter={() => onHover(myIdx)}
            onClick={() => onSelect(it)}
          >
            <Icon name={it.icon} size={16} color="var(--fg-subtle)" />
            <span className="meta">
              <span className="p">{it.primary}</span>
              {it.secondary && <span className="s">{it.secondary}</span>}
            </span>
            {it.type === "action" && (
              <Icon name="arrow-right" size={13} color="var(--fg-muted)" />
            )}
          </button>
        );
      })}
    </div>
  );
}
