"use client";

import React from "react";
import styled from "styled-components";
import { Qr } from "./Qr.jsx";
import {
  localizeContent,
  CHROME_AR,
} from "@/imports/reports/engine/reports.js";

export function CertificatePreview({
  content,
  template,
  code = "PREVIEW",
  status = "draft",
  issuedAt,
  issuer,
  lang = "en",
}) {
  if (!content) {
    return <Empty>Select a subject to preview the document.</Empty>;
  }
  const accent = template?.accent || "var(--accent)";
  const rtl = lang === "ar";
  const loc = localizeContent(content, lang);
  const ct = (s) => (rtl ? CHROME_AR[s] || s : s);
  const statusLabel = rtl ? CHROME_AR[status] || status : status.toUpperCase();
  return (
    <Doc style={{ "--cert-accent": accent }} dir={rtl ? "rtl" : "ltr"}>
      <div className="band" />
      <header className="top">
        <div className="brand">
          <span className="lettermark">{template?.brand || "Manhal"}</span>
          <span className="seal">{template?.seal || "Manhal Registry"}</span>
        </div>
        <div className="meta">
          <span className={`status ${status}`}>{statusLabel}</span>
          {issuedAt && <span className="date">{issuedAt}</span>}
        </div>
      </header>

      <h2 className="heading">{loc.heading}</h2>
      <p className="subject">{loc.subjectLabel}</p>

      <section className="facts">
        {loc.facts.map(([k, v]) => (
          <div className="f" key={k}>
            <span className="k">{k}</span>
            <span className="v">{v}</span>
          </div>
        ))}
      </section>

      <section className="evidence">
        <h3>{loc.evidence.title}</h3>
        <div className="rows">
          {loc.evidence.rows.map(([k, v]) => (
            <div className="row" key={k}>
              <span className="k">{k}</span>
              <span className="v">{v}</span>
            </div>
          ))}
        </div>
      </section>

      <p className="statement">{loc.statement}</p>

      <footer className="foot">
        <div className="verify">
          <Qr code={code} size={84} />
          <div className="vmeta">
            <span className="vlabel">{ct("Verification code")}</span>
            <b className="vcode">{code}</b>
            <span className="vhint">
              {ct("Verify at manhal.sa/reports/verify")}
            </span>
          </div>
        </div>
        <div className="sign">
          <span className="line" />
          <span className="who">{issuer || ct("Authorized issuer")}</span>
        </div>
      </footer>
    </Doc>
  );
}

const Empty = styled.div`
  padding: 48px;
  text-align: center;
  color: var(--fg-subtle);
  font-size: var(--text-sm);
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
`;

const Doc = styled.div`
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 28px 22px;
  overflow: hidden;
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.08));

  .band {
    position: absolute;
    top: 0;
    inset-inline: 0;
    height: 6px;
    background: var(--cert-accent);
  }
  .top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 6px;
  }
  .brand {
    display: flex;
    flex-direction: column;
  }
  .lettermark {
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    color: var(--cert-accent);
    letter-spacing: -0.01em;
  }
  .seal {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 2px;
  }
  .meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
  .status {
    font-size: 10px;
    font-weight: var(--weight-medium);
    letter-spacing: 0.06em;
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    color: var(--fg-subtle);
  }
  .status.issued {
    color: var(--status-success);
    border-color: var(--status-success);
  }
  .status.revoked {
    color: var(--danger);
    border-color: var(--danger);
  }
  .date {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-family: var(--font-mono);
  }
  .heading {
    margin-top: 18px;
    font-size: var(--text-xl);
    font-weight: var(--weight-medium);
    letter-spacing: -0.01em;
  }
  .subject {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--fg-secondary);
    margin-top: 2px;
  }
  .facts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 24px;
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid var(--separator);
  }
  .facts .f {
    display: flex;
    flex-direction: column;
  }
  .facts .k {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .facts .v {
    font-size: var(--text-sm);
    color: var(--fg);
    margin-top: 1px;
  }
  .evidence {
    margin-top: 18px;
    padding: 12px 14px;
    background: var(--surface-2);
    border-radius: var(--radius-md);
  }
  .evidence h3 {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
    margin-bottom: 8px;
  }
  .evidence .row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 0;
    font-size: var(--text-sm);
    border-bottom: 1px solid var(--separator);
  }
  .evidence .row:last-child {
    border-bottom: none;
  }
  .evidence .k {
    color: var(--fg-secondary);
  }
  .evidence .v {
    font-family: var(--font-mono);
    color: var(--fg);
  }
  .statement {
    margin-top: 16px;
    font-size: var(--text-xs);
    color: var(--fg-secondary);
    line-height: 1.6;
  }
  .foot {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--separator);
  }
  .verify {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .vmeta {
    display: flex;
    flex-direction: column;
  }
  .vlabel {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .vcode {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    letter-spacing: 0.04em;
  }
  .vhint {
    font-size: 10px;
    color: var(--fg-subtle);
  }
  .sign {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 160px;
  }
  .sign .line {
    width: 100%;
    height: 1px;
    background: var(--fg-muted);
    margin-bottom: 4px;
  }
  .sign .who {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
`;
