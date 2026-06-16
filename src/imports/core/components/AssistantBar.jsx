"use client";
import React from "react";
import styled from "styled-components";
import { Icon } from "./Icon.jsx";

export function AssistantBar({
  placeholder = "Ask anything…",
  value,
  onChange,
  onSend,
  model = "Auto",
  onPlus,
  style = {},
}) {
  return (
    <Root style={style}>
      <button
        type="button"
        className="plus"
        onClick={onPlus}
        aria-label="Add context"
      >
        <Icon name="plus" size={20} />
      </button>
      <input
        className="field"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSend) onSend();
        }}
        placeholder={placeholder}
      />
      <button type="button" className="model">
        {model}
        <Icon name="caret-down" size={14} />
      </button>
      <button type="button" className="send" onClick={onSend} aria-label="Send">
        <Icon name="paper-plane-right" size={18} weight="fill" />
      </button>
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 520px;
  max-width: 100%;
  height: 56px;
  padding: 0 8px 0 16px;
  border-radius: var(--radius-full);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);

  .plus {
    border: none;
    background: transparent;
    color: var(--fg-muted);
    cursor: pointer;
    display: inline-flex;
    padding: 4px;
  }
  .field {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--fg);
    font-family: var(--font-sans);
    font-size: var(--text-base);
  }
  .model {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    color: var(--fg-muted);
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    padding: 0 6px;
  }
  .send {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex: none;
    border-radius: var(--radius-full);
    border: none;
    background: var(--accent);
    color: var(--accent-fg);
    cursor: pointer;
  }
`;
