"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Icon } from "./Icon.jsx";

export function Select({
  options = [],
  value = "",
  onChange,
  placeholder = "Select…",
  size = "md",
  disabled = false,
  invalid = false,
  block = false,
  ...rest
}) {
  const h = { sm: 32, md: 38, lg: 44 }[size] || 38;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (opt) => {
    onChange?.(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (
      !open &&
      (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")
    ) {
      e.preventDefault();
      setOpen(true);
      setActive(
        Math.max(
          0,
          options.findIndex((o) => o.value === value),
        ),
      );
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (options[active]) pick(options[active]);
    }
  };

  return (
    <Root ref={rootRef} $block={block} {...rest}>
      <Trigger
        type="button"
        $h={h}
        $invalid={invalid}
        $disabled={disabled}
        $open={open}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span className={`label ${selected ? "" : "ph"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon name="caret-up-down" size={14} color="var(--fg-muted)" />
      </Trigger>

      {open && (
        <Menu role="listbox">
          {options.map((o, i) => {
            const isSel = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={isSel}
                className={`opt ${isSel ? "sel" : ""} ${i === active ? "active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(o)}
              >
                <span className="t">{o.label}</span>
                {isSel && <Icon name="check" size={14} />}
              </button>
            );
          })}
        </Menu>
      )}
    </Root>
  );
}

const Root = styled.div`
  position: relative;
  display: ${(p) => (p.$block ? "block" : "inline-block")};
  width: ${(p) => (p.$block ? "100%" : "auto")};
`;

const Trigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  height: ${(p) => p.$h}px;
  padding: 0 10px 0 12px;
  border-radius: var(--radius-lg);
  background: ${(p) => (p.$disabled ? "var(--surface-2)" : "var(--field-bg)")};
  border: 1px solid
    ${(p) =>
      p.$invalid
        ? "var(--danger)"
        : p.$open
          ? "var(--accent)"
          : "var(--border)"};
  box-shadow: ${(p) =>
    p.$open
      ? "0 0 0 var(--ring-focus-width) var(--accent-soft)"
      : "var(--shadow-xs)"};
  color: var(--fg);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? "var(--disabled-opacity)" : 1)};
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;

  .label {
    flex: 1;
    min-width: 0;
    text-align: start;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .label.ph {
    color: var(--fg-muted);
  }
`;

const Menu = styled.div`
  position: absolute;
  z-index: 60;
  top: calc(100% + 6px);
  inset-inline: 0;
  min-width: 100%;
  max-height: 280px;
  overflow: auto;
  padding: 4px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-popover);

  .opt {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    height: 34px;
    padding: 0 10px;
    border: none;
    background: transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--fg);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    text-align: start;
  }
  .opt .t {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .opt.active {
    background: var(--surface-2);
  }
  .opt.sel {
    color: var(--accent);
    font-weight: var(--weight-medium);
  }
`;
