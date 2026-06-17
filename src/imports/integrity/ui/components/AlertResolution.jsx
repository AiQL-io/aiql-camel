"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Textarea } from "@/imports/core/components/Textarea.jsx";
export function AlertResolution({
  alert,
  user,
  mayResolve,
  assignAlert,
  setAlertStatus,
}) {
  const [resolution, setResolution] = useState("");

  return (
    <Card>
      <SectionTitle>
        <Icon name="path" size={15} /> Resolution
      </SectionTitle>
      {!mayResolve && (
        <Gate>
          Resolution is restricted to Geneticist / Registrar / Admin. You can
          review the evidence and trail.
        </Gate>
      )}
      <Actions>
        <Button
          size="sm"
          variant="secondary"
          disabled={!mayResolve || alert.assignee === user.name}
          onClick={() => assignAlert(alert.id, user.name, user.name)}
          leadingIcon={<Icon name="user" size={14} />}
        >
          Assign to me
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!mayResolve || alert.status === "in_review"}
          onClick={() => setAlertStatus(alert.id, "in_review", user.name)}
          leadingIcon={<Icon name="magnifying-glass" size={14} />}
        >
          Mark in review
        </Button>
      </Actions>

      {mayResolve && (
        <Resolve>
          <label>Resolution / dismissal note</label>
          <Textarea
            rows={3}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="What did you find, and what changed?"
          />
          <div className="row">
            <Button
              size="sm"
              variant="primary"
              disabled={alert.status === "resolved"}
              onClick={() => {
                setAlertStatus(
                  alert.id,
                  "resolved",
                  user.name,
                  resolution || undefined,
                );
                setResolution("");
              }}
              leadingIcon={<Icon name="check-circle" size={14} />}
            >
              Resolve
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={alert.status === "dismissed"}
              onClick={() => {
                setAlertStatus(
                  alert.id,
                  "dismissed",
                  user.name,
                  resolution || undefined,
                );
                setResolution("");
              }}
              leadingIcon={<Icon name="x-circle" size={14} />}
            >
              Dismiss
            </Button>
          </div>
        </Resolve>
      )}
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

const Gate = styled.p`
  font-size: var(--text-xs);
  color: var(--fg-subtle);
  line-height: var(--leading-normal);
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const Resolve = styled.div`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .row {
    display: flex;
    gap: 8px;
  }
`;
