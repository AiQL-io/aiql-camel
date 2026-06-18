"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import {
  REPORT_TYPES,
  buildReportContent,
} from "@/imports/reports/engine/reports.js";
import { issueReport } from "@/imports/reports/state/reportsStore.js";
import { useTemplates } from "@/imports/reports/state/templatesStore.js";
import { CertificatePreview } from "./CertificatePreview.jsx";

function AnimalPicker({ access, value, onPick }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return access.animals
      .filter(
        (a) =>
          a.hasDNA &&
          (a.registrationId.toLowerCase().includes(needle) ||
            a.name.toLowerCase().includes(needle)),
      )
      .slice(0, 8);
  }, [q, access]);

  return (
    <Picker>
      <input
        placeholder="Search registration ID or name…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {value && (
        <div className="chosen">
          <Icon name="check-circle" size={14} /> {value.registrationId} ·{" "}
          {value.name}
          <button type="button" onClick={() => onPick(null)}>
            <Icon name="x" size={12} />
          </button>
        </div>
      )}
      {results.length > 0 && (
        <ul>
          {results.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(a);
                  setQ("");
                }}
              >
                <b>{a.registrationId}</b> {a.name}
                <span>
                  {a.breed} · {a.region}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Picker>
  );
}

export function ReportsGenerateView({ access }) {
  const templatesList = useTemplates();
  const [type, setType] = useState("identity_certificate");
  const [animal, setAnimal] = useState(null);
  const [templateId, setTemplateId] = useState("manhal_official");
  const [lang, setLang] = useState("en");
  const [issued, setIssued] = useState(null);

  const def = REPORT_TYPES.find((t) => t.id === type);
  const template =
    templatesList.find((t) => t.id === templateId) || templatesList[0];

  const subjectIds = useMemo(() => {
    if (!def) return [];
    if (def.subject === "animal") return animal ? [animal.id] : [];
    if (def.subject === "trio") {
      if (!animal) return [];
      const a = access.getAnimal(animal.id);
      return [animal.id, a?._trueSireId, a?._trueDamId].filter(Boolean);
    }
    return [];
  }, [def, animal, access]);

  const needsSubject = def && def.subject !== "population";
  const ready = !needsSubject || subjectIds.length > 0;

  const content = useMemo(
    () => (ready ? buildReportContent(access, type, subjectIds) : null),
    [access, type, subjectIds, ready],
  );

  const onIssue = () => {
    const rec = issueReport({
      access,
      type,
      subjectIds,
      templateId,
      generatedBy: "demo-user",
    });
    setIssued(rec);
  };

  return (
    <Grid>
      <div className="left">
        <Card>
          <Overline>Document type</Overline>
          <Types>
            {REPORT_TYPES.map((t) => (
              <button
                type="button"
                key={t.id}
                className={type === t.id ? "on" : ""}
                onClick={() => {
                  setType(t.id);
                  setIssued(null);
                }}
              >
                <Icon name={t.icon} size={16} />
                <span className="tl">{t.label}</span>
                <span className="tb">{t.blurb}</span>
              </button>
            ))}
          </Types>
        </Card>

        {needsSubject && (
          <Card>
            <Overline>
              Subject {def.subject === "trio" ? "(offspring)" : "(animal)"}
            </Overline>
            <div style={{ marginTop: 10 }}>
              <AnimalPicker access={access} value={animal} onPick={setAnimal} />
            </div>
            {def.subject === "trio" && animal && (
              <p className="trionote">
                <Icon name="info" size={12} /> Declared sire &amp; dam are
                resolved from the registry pedigree and verified on the
                certificate.
              </p>
            )}
          </Card>
        )}

        <Card>
          <Overline>Template &amp; branding</Overline>
          <Templates>
            {templatesList.map((t) => (
              <button
                type="button"
                key={t.id}
                className={templateId === t.id ? "on" : ""}
                onClick={() => setTemplateId(t.id)}
              >
                <span className="dot" style={{ background: t.accent }} />
                {t.name}
              </button>
            ))}
          </Templates>
          <div className="langrow">
            <span className="lab">Layout</span>
            <div className="seg">
              <button
                type="button"
                className={lang === "en" ? "on" : ""}
                onClick={() => setLang("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={lang === "ar" ? "on" : ""}
                onClick={() => setLang("ar")}
              >
                AR (RTL)
              </button>
            </div>
          </div>
        </Card>

        {issued ? (
          <Issued>
            <Icon name="seal-check" size={18} />
            <div>
              <b>Document issued</b>
              <span>
                Code <code>{issued.verificationCode}</code> · added to history.
              </span>
              <div className="acts">
                <Button
                  size="sm"
                  variant="secondary"
                  as={Link}
                  href={`/reports/verify/${issued.verificationCode}`}
                  leadingIcon={<Icon name="qr-code" size={14} />}
                >
                  Open verification
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  as={Link}
                  href="/reports/history"
                >
                  View history
                </Button>
              </div>
            </div>
          </Issued>
        ) : (
          <Button
            variant="primary"
            disabled={!ready}
            onClick={onIssue}
            leadingIcon={<Icon name="seal-check" size={16} />}
          >
            Issue document
          </Button>
        )}
      </div>

      <div className="right">
        <PreviewHead>
          <Overline>Preview</Overline>
          {!issued && <span className="draft">Draft — not yet issued</span>}
        </PreviewHead>
        <CertificatePreview
          content={content}
          template={template}
          code={issued ? issued.verificationCode : "PREVIEW"}
          status={issued ? "issued" : "draft"}
          issuedAt={
            issued ? new Date(issued.generatedAt).toLocaleDateString() : null
          }
          issuer={issued ? issued.generatedBy : "Authorized issuer"}
          lang={lang}
        />
      </div>
    </Grid>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: 20px;
  align-items: start;

  .left {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .trionote,
  .right .draft {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .trionote {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
  }
  .right {
    position: sticky;
    top: 24px;
  }
  .langrow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
  }
  .langrow .lab {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .seg {
    display: flex;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }
  .seg button {
    border: none;
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    padding: 5px 10px;
    cursor: pointer;
  }
  .seg button.on {
    background: var(--accent-soft);
    color: var(--accent);
  }
`;

const PreviewHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Types = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;

  button {
    display: grid;
    grid-template-columns: 18px 1fr;
    grid-template-rows: auto auto;
    column-gap: 8px;
    text-align: start;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    cursor: pointer;
  }
  button.on {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  button :global(i),
  button > svg {
    grid-row: 1 / span 2;
    color: var(--accent);
  }
  .tl {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .tb {
    grid-column: 2;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-top: 2px;
  }
`;

const Templates = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;

  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface);
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  button.on {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
`;

const Picker = styled.div`
  position: relative;

  input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    color: var(--fg);
    font-size: var(--text-sm);
  }
  .chosen {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    background: var(--accent-soft);
    color: var(--accent);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
  }
  .chosen button {
    border: none;
    background: transparent;
    color: var(--accent);
    cursor: pointer;
    display: inline-flex;
  }
  ul {
    list-style: none;
    margin: 6px 0 0;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    box-shadow: var(--shadow-md);
  }
  ul button {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: start;
    border: none;
    background: transparent;
    padding: 7px 8px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--text-sm);
  }
  ul button:hover {
    background: var(--surface-2);
  }
  ul button b {
    font-family: var(--font-mono);
    margin-inline-end: 6px;
  }
  ul button span {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;

const Issued = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--status-success);
  background: color-mix(in srgb, var(--status-success) 8%, var(--surface));
  border-radius: var(--radius-lg);
  color: var(--status-success);

  > div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  b {
    color: var(--fg);
  }
  span {
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  code {
    font-family: var(--font-mono);
    color: var(--fg);
  }
  .acts {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
`;
