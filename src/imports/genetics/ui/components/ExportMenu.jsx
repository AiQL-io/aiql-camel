"use client";

import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import {
  downloadSvg,
  downloadSvgAsPng,
} from "@/imports/verify/ui/components/exporters.js";

export function ExportMenu({ items = [], figureRef, figureName }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <Wrap ref={wrap}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setOpen((o) => !o)}
        leadingIcon={<Icon name="download-simple" size={14} />}
        trailingIcon={<Icon name="caret-down" size={12} />}
      >
        Export
      </Button>
      {open && (
        <Menu role="menu">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              onClick={() => {
                it.onClick();
                setOpen(false);
              }}
            >
              <Icon name={it.icon || "download-simple"} size={14} />
              {it.label}
            </button>
          ))}
          {figureRef && (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  const svg = figureRef.current
                    ? figureRef.current.querySelector("svg")
                    : null;
                  downloadSvgAsPng(svg, `${figureName || "figure"}.png`);
                  setOpen(false);
                }}
              >
                <Icon name="image" size={14} />
                Figure (PNG)
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  const svg = figureRef.current
                    ? figureRef.current.querySelector("svg")
                    : null;
                  downloadSvg(svg, `${figureName || "figure"}.svg`);
                  setOpen(false);
                }}
              >
                <Icon name="image" size={14} />
                Figure (SVG)
              </button>
            </>
          )}
        </Menu>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  inset-inline-end: 0;
  z-index: 30;
  min-width: 200px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.18));
  padding: 6px;
  display: flex;
  flex-direction: column;

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: none;
    background: transparent;
    color: var(--fg);
    font-size: var(--text-sm);
    text-align: start;
    border-radius: var(--radius-md);
    cursor: pointer;
  }
  button:hover {
    background: var(--surface-2);
  }
`;
