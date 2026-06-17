"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Icon } from "./Icon.jsx";
import { PaletteGroup } from "./PaletteGroup.jsx";
import { useDataset } from "@/imports/core/data/useDataset.js";

const ACTIONS = [
  {
    id: "a-reg",
    icon: "identification-card",
    label: "Open registry",
    href: "/registry",
  },
  {
    id: "a-match",
    icon: "fingerprint",
    label: "Identity matching (genotype search)",
    href: "/registry/match",
  },
  { id: "a-new", icon: "plus", label: "Add camel", href: "/registry/new" },
  {
    id: "a-verify",
    icon: "git-fork",
    label: "Run verification",
    href: "/verify",
  },
  {
    id: "a-reverse",
    icon: "magnifying-glass",
    label: "Reverse parentage search",
    href: "/verify/search",
  },
  {
    id: "a-rel",
    icon: "graph",
    label: "Open relatedness matrix",
    href: "/genetics/relatedness",
  },
  {
    id: "a-pop",
    icon: "chart-scatter",
    label: "Population dashboard",
    href: "/genetics",
  },
  {
    id: "a-integrity",
    icon: "shield-check",
    label: "Registry integrity alerts",
    href: "/integrity",
  },
  {
    id: "a-reports",
    icon: "certificate",
    label: "Reports & certificates",
    href: "/reports",
  },
];

export function CommandPalette({ open, onClose }) {
  const router = useRouter();
  const { access } = useDataset();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(id);
  }, []);

  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    const animals = query
      ? access.animals
          .filter((a) => a._search.includes(query))
          .slice(0, 6)
          .map((a) => ({
            type: "camel",
            id: a.id,
            icon: "identification-card",
            primary: `${a.name} · ${a.nameArabic}`,
            secondary: `${a.registrationId} · ${a.breed} · ${a.ownerName}`,
            href: `/registry/${a.id}`,
          }))
      : [];
    const owners = query
      ? access.owners
          .filter((o) => o.name.toLowerCase().includes(query))
          .slice(0, 4)
          .map((o) => ({
            type: "owner",
            id: o.id,
            icon: "buildings",
            primary: o.name,
            secondary: `${o.region} · stable`,
            href: `/registry?owner=${o.id}`,
          }))
      : [];
    const actions = ACTIONS.filter(
      (a) => !query || a.label.toLowerCase().includes(query),
    ).map((a) => ({ ...a, type: "action", primary: a.label }));
    return { animals, owners, actions };
  }, [q, access]);

  const flat = useMemo(
    () => [...groups.animals, ...groups.owners, ...groups.actions],
    [groups],
  );
  const activeIdx = Math.min(active, Math.max(0, flat.length - 1));

  if (!open) return null;

  const go = (item) => {
    if (!item) return;
    onClose?.();
    router.push(item.href);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose?.();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.min(flat.length - 1, activeIdx + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(0, activeIdx - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[activeIdx]);
    }
  };

  const ownersBase = groups.animals.length;
  const actionsBase = groups.animals.length + groups.owners.length;

  return (
    <Root onMouseDown={onClose}>
      <Panel onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKeyDown}>
        <div className="search">
          <Icon name="magnifying-glass" size={18} color="var(--fg-subtle)" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            placeholder="Search camels, owners, actions… or a genotype"
          />
          <kbd>esc</kbd>
        </div>
        <div className="results">
          {flat.length === 0 && (
            <div className="empty">
              No matches. Try a name, reg ID, or owner.
            </div>
          )}
          <PaletteGroup
            label="Camels"
            items={groups.animals}
            base={0}
            activeIdx={activeIdx}
            onHover={setActive}
            onSelect={go}
          />
          <PaletteGroup
            label="Owners"
            items={groups.owners}
            base={ownersBase}
            activeIdx={activeIdx}
            onHover={setActive}
            onSelect={go}
          />
          <PaletteGroup
            label="Actions"
            items={groups.actions}
            base={actionsBase}
            activeIdx={activeIdx}
            onHover={setActive}
            onSelect={go}
          />
        </div>
      </Panel>
    </Root>
  );
}

const Root = styled.div`
  position: fixed;
  inset: 0;
  z-index: 300;
  background: var(--scrim, rgba(0, 0, 0, 0.4));
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 12vh;
`;

const Panel = styled.div`
  width: 640px;
  max-width: 92vw;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  overflow: hidden;

  .search {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
  }
  .search input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--fg);
    font-size: var(--text-base);
    outline: none;
  }
  .search kbd {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    background: var(--bg-muted);
    border: 1px solid var(--border);
    border-radius: var(--radius-xs);
    padding: 1px 6px;
  }
  .results {
    overflow-y: auto;
    padding: 8px;
  }
  .empty {
    padding: 24px 12px;
    text-align: center;
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  .group + .group {
    margin-top: 6px;
  }
  .glabel {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
    padding: 6px 10px 4px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 9px 10px;
    border: none;
    background: transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    text-align: start;
    color: var(--fg);
  }
  .row.on {
    background: var(--surface-2);
  }
  .row .meta {
    flex: 1;
    min-width: 0;
  }
  .row .p {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row .s {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
