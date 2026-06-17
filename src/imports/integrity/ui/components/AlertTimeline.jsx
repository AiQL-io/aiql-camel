"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Textarea } from "@/imports/core/components/Textarea.jsx";
export function AlertTimeline({ alert, user, addAlertNote }) {
  const [note, setNote] = useState("");

  return (
    <Card>
      <SectionTitle>
        <Icon name="clock-counter-clockwise" size={15} /> Audit trail
      </SectionTitle>
      <Timeline>
        {alert.timeline.map((t, i) => (
          <li key={i}>
            <span className="dot" />
            <div>
              <span className="act">{t.action}</span>
              <span className="by">
                {t.by} · {String(t.at).slice(0, 16).replace("T", " ")}
              </span>
            </div>
          </li>
        ))}
      </Timeline>

      <NotesTitle>
        <Icon name="chat-text" size={15} /> Notes
      </NotesTitle>
      {alert.notes.length === 0 && <Gate>No notes yet.</Gate>}
      {alert.notes.map((n, i) => (
        <Note key={i}>
          <span className="who">{n.author}</span>
          <span className="txt">{n.text}</span>
          <span className="at">
            {String(n.at).slice(0, 16).replace("T", " ")}
          </span>
        </Note>
      ))}
      <AddNote>
        <Textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add an investigation note…"
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={!note.trim()}
          onClick={() => {
            addAlertNote(alert.id, note.trim(), user.name);
            setNote("");
          }}
        >
          Add note
        </Button>
      </AddNote>
    </Card>
  );
}

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--fg-subtle);
  margin-bottom: 12px;
`;

const NotesTitle = styled(SectionTitle)`
  margin-top: 18px;
`;

const Gate = styled.p`
  font-size: var(--text-xs);
  color: var(--fg-subtle);
  line-height: var(--leading-normal);
`;

const Timeline = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;

  li {
    display: flex;
    gap: 10px;
  }
  .dot {
    width: 8px;
    height: 8px;
    margin-top: 5px;
    border-radius: 50%;
    background: var(--accent);
    flex: none;
  }
  .act {
    display: block;
    font-size: var(--text-sm);
    color: var(--fg);
  }
  .by {
    display: block;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-family: var(--font-mono);
  }
`;

const Note = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid var(--separator);
  border-radius: var(--radius-lg);
  background: var(--surface-2);

  .who {
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
  }
  .txt {
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  .at {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-family: var(--font-mono);
  }
`;

const AddNote = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
`;
