"use client";
import React from "react";
import styled from "styled-components";

export function Textarea({
  rows = 3,
  invalid = false,
  disabled = false,
  style = {},
  ...rest
}) {
  return (
    <Field
      rows={rows}
      disabled={disabled}
      $invalid={invalid}
      $disabled={disabled}
      style={style}
      {...rest}
    />
  );
}

const Field = styled.textarea`
  width: 100%;
  resize: vertical;
  padding: 10px 12px;
  border-radius: var(--radius-lg);
  background: ${(p) => (p.$disabled ? "var(--surface-2)" : "var(--field-bg)")};
  border: 1px solid ${(p) => (p.$invalid ? "var(--danger)" : "var(--border)")};
  box-shadow: var(--shadow-xs);
  color: var(--fg);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  outline: none;
  opacity: ${(p) => (p.$disabled ? "var(--disabled-opacity)" : 1)};
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;

  ${(p) =>
    !p.$invalid &&
    `
    &:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 var(--ring-focus-width) var(--accent-soft);
    }
  `}
`;
