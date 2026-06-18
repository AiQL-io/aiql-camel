"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { useGeneticsState } from "@/imports/genetics/state/scopeStore.js";

export function SaveCohort({
  ids = [],
  origin,
  defaultName = "Selection",
  size = "sm",
  variant = "primary",
  label = "Save as cohort",
  navigate = false,
}) {
  const { saveCohortIds, setScopeCohort } = useGeneticsState();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [saved, setSaved] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const disabled = ids.length === 0;

  const commit = () => {
    const finalName = name.trim() || defaultName;
    const id = saveCohortIds(finalName, ids, origin);
    setScopeCohort(id);
    setOpen(false);
    setSaved(true);
    if (navigate) router.push("/genetics/cohorts");
  };

  return (
    <Wrap ref={wrap}>
      <Button
        size={size}
        variant={variant}
        disabled={disabled}
        onClick={() => {
          setName(`${defaultName} (${ids.length})`);
          setSaved(false);
          setOpen((o) => !o);
        }}
        leadingIcon={<Icon name="users-three" size={14} />}
      >
        {saved ? "Cohort saved" : label}
      </Button>
      {open && (
        <Pop>
          <label>Cohort name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setOpen(false);
            }}
          />
          <p className="hint">
            {ids.length} animal{ids.length === 1 ? "" : "s"} from{" "}
            {origin || "selection"}.
          </p>
          <div className="row">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={commit}>
              Save & view
            </Button>
          </div>
        </Pop>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  display: inline-block;
`;

const Pop = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  inset-inline-end: 0;
  z-index: 30;
  width: 260px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.18));
  padding: 12px;

  label {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  input {
    width: 100%;
    margin-top: 6px;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    color: var(--fg);
    font-size: var(--text-sm);
  }
  .hint {
    margin-top: 8px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .row {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
  }
`;
