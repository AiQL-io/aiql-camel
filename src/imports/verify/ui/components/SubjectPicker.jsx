"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import styled from "styled-components";
import { Icon } from "@/imports/core/components/Icon.jsx";

const MIN_PARENT_AGE = 3;
const recents = [];

function pushRecent(animal) {
  const i = recents.findIndex((r) => r.id === animal.id);
  if (i !== -1) recents.splice(i, 1);
  recents.unshift(animal);
  if (recents.length > 6) recents.pop();
}

export function SubjectPicker({
  access,
  value,
  onChange,
  label,
  role = "offspring",
  offspring = null,
  placeholder = "Select an animal…",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);
  const rootRef = useRef(null);
  const selected = value ? access.getAnimal(value) : null;
  const wantSex = role === "sire" ? "male" : role === "dam" ? "female" : null;

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    let rows = access.animals;
    if (!showAll && wantSex) rows = rows.filter((a) => a.sex === wantSex);
    if (!showAll && offspring && (role === "sire" || role === "dam"))
      rows = rows.filter(
        (a) => a.birthYear <= offspring.birthYear - MIN_PARENT_AGE,
      );
    if (query) rows = rows.filter((a) => a._search.includes(query));
    else if (recents.length)
      return recents
        .filter((a) => !wantSex || showAll || a.sex === wantSex)
        .slice(0, 6);
    return rows.slice(0, 30);
  }, [access, q, wantSex, showAll, offspring, role]);

  const warnings = [];
  if (selected) {
    if (wantSex && selected.sex !== wantSex)
      warnings.push(
        `Selected ${selected.sex}; a ${role} is normally ${wantSex}.`,
      );
    if (offspring && (role === "sire" || role === "dam")) {
      if (selected.birthYear > offspring.birthYear - MIN_PARENT_AGE)
        warnings.push(
          `Born ${selected.birthYear} — implausibly young to be a parent of a ${offspring.birthYear} animal.`,
        );
    }
    if (!selected.hasDNA) warnings.push("No DNA profile — can't be tested.");
  }

  const pick = (a) => {
    pushRecent(a);
    onChange?.(a.id);
    setOpen(false);
    setQ("");
  };

  return (
    <Root ref={rootRef}>
      {label && <span className="lbl">{label}</span>}
      <button
        type="button"
        className={`trigger ${selected ? "" : "ph"}`}
        onClick={() => setOpen((o) => !o)}
      >
        {selected ? (
          <span className="sel">
            <span className="nm">{selected.name}</span>
            <span className="meta">
              {selected.registrationId} · {selected.sex} · {selected.breed}
            </span>
          </span>
        ) : (
          placeholder
        )}
        <Icon name="caret-down" size={14} color="var(--fg-muted)" />
      </button>

      {warnings.map((w, i) => (
        <span key={i} className="warn">
          <Icon name="warning" size={12} /> {w}
        </span>
      ))}

      {open && (
        <div className="pop">
          <div className="search">
            <Icon name="magnifying-glass" size={15} color="var(--fg-subtle)" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, reg ID, microchip, owner…"
            />
          </div>
          {wantSex && (
            <label className="showall">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
              />
              Show all (ignore sex/age constraints)
            </label>
          )}
          <div className="list">
            {!q && recents.length > 0 && <div className="hdr">Recent</div>}
            {results.length === 0 && <div className="empty">No matches.</div>}
            {results.map((a) => (
              <button
                key={a.id}
                type="button"
                className="row"
                onClick={() => pick(a)}
              >
                <span className="who">
                  <span className="nm">{a.name}</span>
                  <span className="meta">
                    {a.registrationId} · {a.sex} · {a.breed}
                  </span>
                </span>
                <span
                  className={`dna ${a.hasDNA ? "" : "no"}`}
                  title={a.hasDNA ? "DNA on file" : "No DNA"}
                >
                  <Icon
                    name={a.hasDNA ? "check-circle" : "minus-circle"}
                    size={14}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Root>
  );
}

const Root = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;

  .lbl {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fg-subtle);
    margin-bottom: 6px;
  }
  .trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    height: 46px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--field-bg);
    color: var(--fg);
    cursor: pointer;
    text-align: start;
  }
  .trigger.ph {
    color: var(--fg-muted);
  }
  .sel .nm {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .sel .meta {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .warn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 6px;
    font-size: var(--text-xs);
    color: var(--warning);
  }
  .pop {
    position: absolute;
    z-index: 70;
    top: calc(100% + 6px);
    inset-inline: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-popover);
    overflow: hidden;
  }
  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
  }
  .search input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--fg);
    font-size: var(--text-sm);
    outline: none;
  }
  .showall {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    font-size: var(--text-xs);
    color: var(--fg-secondary);
    border-bottom: 1px solid var(--separator);
    cursor: pointer;
  }
  .list {
    max-height: 280px;
    overflow-y: auto;
    padding: 6px;
  }
  .hdr {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
    padding: 6px 8px 2px;
  }
  .empty {
    padding: 16px 8px;
    text-align: center;
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    background: transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    text-align: start;
  }
  .row:hover {
    background: var(--surface-2);
  }
  .row .nm {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--fg);
  }
  .row .meta {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .dna {
    color: var(--status-success);
    flex: none;
  }
  .dna.no {
    color: var(--fg-muted);
  }
`;
