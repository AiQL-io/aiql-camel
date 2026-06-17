"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";

export function CaseNotes({ sel, user, addNote }) {
  const [note, setNote] = useState("");

  return (
    <Notes>
      <SectionTitle>Notes & timeline</SectionTitle>
      <div className="addnote">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a reviewer note…"
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            addNote(sel.id, note, user.name);
            setNote("");
          }}
        >
          Add
        </Button>
      </div>
      <div className="timeline">
        {sel.notes.map((n, i) => (
          <div className="tl note" key={`n${i}`}>
            <Icon name="chat-circle" size={14} />
            <span>
              <b>{n.text}</b>
              <i>
                {n.author} · {n.at.slice(0, 16).replace("T", " ")}
              </i>
            </span>
          </div>
        ))}
        {[...sel.timeline].reverse().map((t, i) => (
          <div className="tl" key={`t${i}`}>
            <Icon name="dot-outline" size={14} />
            <span>
              {t.action}
              <i>
                {t.by} · {t.at.slice(0, 16).replace("T", " ")}
              </i>
            </span>
          </div>
        ))}
      </div>
    </Notes>
  );
}

const SectionTitle = styled(Overline)`
  display: block;
  margin-bottom: 8px;
`;

const Notes = styled.div`
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--separator);

  .addnote {
    display: flex;
    gap: 8px;
  }
  .addnote input {
    flex: 1;
    height: 34px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--field-bg);
    color: var(--fg);
    font-size: var(--text-sm);
  }
  .timeline {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .tl {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  .tl i {
    display: block;
    font-style: normal;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 1px;
  }
  .tl.note b {
    font-weight: var(--weight-medium);
    color: var(--fg);
  }
`;
