"use client";

import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { exportPacket } from "./caseHelpers.js";

export function CaseWorkflow({
  sel,
  user,
  can,
  canApprove,
  transitionCase,
  issueCertificate,
  revokeCertificate,
}) {
  return (
    <>
      <Workflow>
        {sel.status === "draft" && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => transitionCase(sel.id, "review", user.name)}
            leadingIcon={<Icon name="paper-plane-tilt" size={14} />}
          >
            Submit for review
          </Button>
        )}
        {sel.status === "review" && (
          <>
            <Button
              size="sm"
              variant="primary"
              disabled={!canApprove}
              onClick={() => transitionCase(sel.id, "approved", user.name)}
              leadingIcon={<Icon name="check" size={14} />}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={!canApprove}
              onClick={() => transitionCase(sel.id, "rejected", user.name)}
              leadingIcon={<Icon name="x" size={14} />}
            >
              Reject
            </Button>
            {!canApprove && (
              <span className="gate">
                Approval restricted to Geneticist / Registrar.
              </span>
            )}
          </>
        )}
        {(sel.status === "approved" || sel.status === "rejected") && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => transitionCase(sel.id, "review", user.name)}
            leadingIcon={<Icon name="arrow-counter-clockwise" size={14} />}
          >
            Re-open
          </Button>
        )}
        {sel.status === "approved" &&
          !sel.certificate &&
          can("issueCertificate") && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => issueCertificate(sel.id, user.name)}
              leadingIcon={<Icon name="certificate" size={14} />}
            >
              Issue certificate
            </Button>
          )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => exportPacket(sel)}
          leadingIcon={<Icon name="download-simple" size={14} />}
        >
          Export packet
        </Button>
      </Workflow>

      {sel.certificate && (
        <Certificate $revoked={sel.certificate.revoked}>
          <Icon name="certificate" size={18} />
          <div>
            <span className="code">{sel.certificate.code}</span>
            <span className="meta">
              {sel.certificate.revoked
                ? "Revoked"
                : `Issued ${sel.certificate.issuedAt.slice(0, 10)}`}{" "}
              ·{" "}
              <Link href={`/reports/verify/${sel.certificate.code}`}>
                verification view
              </Link>
            </span>
          </div>
          {!sel.certificate.revoked && can("issueCertificate") && (
            <button
              type="button"
              onClick={() => revokeCertificate(sel.id, user.name)}
            >
              Revoke
            </button>
          )}
        </Certificate>
      )}
      {sel.alertRaised && (
        <AlertLink>
          <Icon name="flag" size={14} /> Integrity alert raised ·{" "}
          <Link href="/integrity">reconciliation</Link>
        </AlertLink>
      )}
    </>
  );
}

const Workflow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--separator);

  .gate {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    align-self: center;
  }
`;

const Certificate = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px solid
    ${(p) => (p.$revoked ? "var(--border)" : "var(--status-success)")};
  border-radius: var(--radius-lg);
  background: ${(p) =>
    p.$revoked
      ? "var(--surface-2)"
      : "color-mix(in srgb, var(--status-success) 8%, var(--surface))"};
  color: ${(p) => (p.$revoked ? "var(--fg-subtle)" : "var(--status-success)")};

  .code {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .meta {
    display: block;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .meta a {
    color: var(--accent);
  }
  button {
    margin-inline-start: auto;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    height: 26px;
    padding: 0 10px;
    border-radius: var(--radius-pill);
    cursor: pointer;
  }
`;

const AlertLink = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: var(--text-sm);
  color: var(--danger);
`;
