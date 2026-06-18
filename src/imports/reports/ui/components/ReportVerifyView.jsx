"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import {
  useReports,
  findByCode,
  typeLabel,
} from "@/imports/reports/state/reportsStore.js";
import { findCertByCode } from "@/imports/verify/state/caseStore.js";
import {
  buildReportContent,
  TEMPLATES,
} from "@/imports/reports/engine/reports.js";
import { CertificatePreview } from "./CertificatePreview.jsx";

export function ReportVerifyView({ access, code }) {
  useReports(access); // ensure seeded
  const router = useRouter();
  const [input, setInput] = useState(code || "");

  const record = useMemo(
    () => (code ? findByCode(code) || findCertByCode(code) : null),
    [code],
  );

  const content = useMemo(() => {
    if (!record) return null;
    if (record.content) return record.content;
    return buildReportContent(access, record.type, record.subjectIds);
  }, [access, record]);

  const submit = (e) => {
    e.preventDefault();
    const c = input.trim();
    if (c) router.push(`/reports/verify/${encodeURIComponent(c)}`);
  };

  const valid = record && record.status === "issued";
  const revoked = record && record.status === "revoked";
  const notFound = code && !record;
  const template = record
    ? TEMPLATES.find((t) => t.id === record.templateId)
    : TEMPLATES[0];

  return (
    <Wrap>
      <Card>
        <Overline>Document authenticity check</Overline>
        <p className="lead">
          Enter or scan a verification code to confirm a certificate&apos;s
          authenticity and key facts — the public trust check for a national
          certifying body.
        </p>
        <form onSubmit={submit} className="form">
          <input
            placeholder="MNHL-XXXX-XXXX"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            leadingIcon={<Icon name="magnifying-glass" size={14} />}
          >
            Verify
          </Button>
        </form>
      </Card>

      {code && (
        <div className="result">
          {valid && (
            <Banner className="ok">
              <Icon name="seal-check" size={20} />
              <div>
                <b>Authentic document</b>
                <span>
                  This {typeLabel(record.type)} was issued by{" "}
                  {record.generatedBy} on{" "}
                  {new Date(record.generatedAt).toLocaleDateString()} and is
                  currently valid.
                </span>
              </div>
            </Banner>
          )}
          {revoked && (
            <Banner className="revoked">
              <Icon name="warning" size={20} />
              <div>
                <b>Revoked document</b>
                <span>
                  This code matches a {typeLabel(record.type)} that has been
                  revoked and is no longer valid.
                </span>
              </div>
            </Banner>
          )}
          {notFound && (
            <Banner className="notfound">
              <Icon name="x-circle" size={20} />
              <div>
                <b>No document found</b>
                <span>
                  No issued document matches code <code>{code}</code>. Check the
                  code and try again.
                </span>
              </div>
            </Banner>
          )}

          {record && (
            <div className="doc">
              <CertificatePreview
                content={content}
                template={template}
                code={record.verificationCode}
                status={record.status}
                issuedAt={new Date(record.generatedAt).toLocaleDateString()}
                issuer={record.generatedBy}
              />
            </div>
          )}
        </div>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  max-width: 720px;

  .lead {
    font-size: var(--text-sm);
    color: var(--fg-secondary);
    margin: 8px 0 14px;
    line-height: 1.55;
  }
  .form {
    display: flex;
    gap: 10px;
  }
  .form input {
    flex: 1;
    padding: 9px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    letter-spacing: 0.04em;
  }
  .result {
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

const Banner = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);

  > div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  b {
    font-size: var(--text-sm);
  }
  span {
    font-size: var(--text-sm);
    color: var(--fg-secondary);
    line-height: 1.5;
  }
  code {
    font-family: var(--font-mono);
  }
  &.ok {
    border-color: var(--status-success);
    background: color-mix(in srgb, var(--status-success) 8%, var(--surface));
    color: var(--status-success);
  }
  &.revoked {
    border-color: var(--danger);
    background: color-mix(in srgb, var(--danger) 8%, var(--surface));
    color: var(--danger);
  }
  &.notfound {
    border-color: var(--fg-muted);
    color: var(--fg-secondary);
  }
`;
