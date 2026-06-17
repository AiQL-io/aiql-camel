"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { Icon } from "./Icon.jsx";

export function Drawer({ open, onClose, title, width = 420, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <Root $open={open} aria-hidden={!open}>
      <Scrim onClick={onClose} $open={open} />
      <Panel $open={open} $width={width} role="dialog" aria-modal="true">
        <Head>
          <span className="title">{title}</span>
          <button type="button" onClick={onClose} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </Head>
        <Body>{children}</Body>
      </Panel>
    </Root>
  );
}

const Root = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};
`;

const Scrim = styled.div`
  position: absolute;
  inset: 0;
  background: var(--scrim, rgba(0, 0, 0, 0.4));
  opacity: ${(p) => (p.$open ? 1 : 0)};
  transition: opacity 180ms ease;
`;

const Panel = styled.aside`
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  height: 100%;
  width: ${(p) => p.$width}px;
  max-width: 92vw;
  background: var(--surface);
  border-inline-start: 1px solid var(--border);
  box-shadow: var(--shadow-popover);
  transform: translateX(${(p) => (p.$open ? "0" : "100%")});
  transition: transform 220ms cubic-bezier(0.32, 0.72, 0, 1);
  display: flex;
  flex-direction: column;

  [dir="rtl"] & {
    transform: translateX(${(p) => (p.$open ? "0" : "-100%")});
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);

  .title {
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
  }
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-subtle);
    cursor: pointer;
  }
  button:hover {
    background: var(--surface-2);
    color: var(--fg);
  }
`;

const Body = styled.div`
  flex: 1;
  overflow: auto;
  padding: 20px;
`;
