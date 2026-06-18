"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { buildReportContent } from "@/imports/reports/engine/reports.js";
import {
  useTemplates,
  updateTemplate,
  addTemplate,
} from "@/imports/reports/state/templatesStore.js";
import { Button } from "@/imports/core/components/Button.jsx";
import { CertificatePreview } from "./CertificatePreview.jsx";

export function ReportTemplatesView({ access }) {
  const templates = useTemplates();
  const [activeId, setActiveId] = useState(templates[0].id);
  const [lang, setLang] = useState("en");
  const template = templates.find((t) => t.id === activeId) || templates[0];

  const sample = access.animals.find((a) => a.hasDNA);
  const content = buildReportContent(access, "identity_certificate", [
    sample?.id,
  ]);

  return (
    <Grid>
      <div className="left">
        <Card>
          <Head>
            <Overline>Templates</Overline>
            <button
              type="button"
              className="add"
              onClick={() => setActiveId(addTemplate())}
            >
              <Icon name="plus" size={12} /> New
            </button>
          </Head>
          <List>
            {templates.map((t) => (
              <button
                type="button"
                key={t.id}
                className={activeId === t.id ? "on" : ""}
                onClick={() => setActiveId(t.id)}
              >
                <span className="dot" style={{ background: t.accent }} />
                <span className="body">
                  <b>{t.name}</b>
                  <span className="seal">{t.seal}</span>
                </span>
                {activeId === t.id && <Icon name="check" size={14} />}
              </button>
            ))}
          </List>
        </Card>

        <Card>
          <Overline>Branding slots — editable</Overline>
          <Slots>
            <label className="slot">
              <span className="k">Template name</span>
              <input
                value={template.name}
                onChange={(e) =>
                  updateTemplate(template.id, { name: e.target.value })
                }
              />
            </label>
            <label className="slot">
              <span className="k">Lettermark</span>
              <input
                value={template.brand}
                onChange={(e) =>
                  updateTemplate(template.id, { brand: e.target.value })
                }
              />
            </label>
            <label className="slot">
              <span className="k">Issuing seal</span>
              <input
                value={template.seal}
                onChange={(e) =>
                  updateTemplate(template.id, { seal: e.target.value })
                }
              />
            </label>
            <label className="slot">
              <span className="k">Accent</span>
              <span className="accentedit">
                <input
                  type="color"
                  value={template.accent}
                  onChange={(e) =>
                    updateTemplate(template.id, { accent: e.target.value })
                  }
                />
                <span className="mono">{template.accent}</span>
              </span>
            </label>
          </Slots>
          <div className="langrow">
            <span className="lab">Bilingual layout</span>
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
          <p className="note">
            <Icon name="info" size={12} /> Lettermarks for Manhal, KFSH, and
            Saudi Camel Club, with mirrored EN/AR (RTL) layouts, styled per the
            AiQL design system.
          </p>
        </Card>
      </div>

      <div className="right">
        <Overline>Live template preview</Overline>
        <div style={{ marginTop: 12 }}>
          <CertificatePreview
            content={content}
            template={template}
            code="SAMPLE-PREVIEW"
            status="draft"
            issuer="Template preview"
            lang={lang}
          />
        </div>
      </div>
    </Grid>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: 20px;
  align-items: start;
  max-width: 1080px;
  margin: 0 auto;

  .left {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .right {
    position: sticky;
    top: 24px;
  }
  .langrow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 14px;
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
  .note {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 14px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    line-height: 1.5;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;

  button {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    cursor: pointer;
    text-align: start;
    height: 83px;
  }
  button.on {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex: none;
  }
  .body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: flex-start;
    flex: 1;
    margin-top: 5px;
  }
  .body b {
    font-size: var(--text-sm);
    line-height: 1.2;
  }
  .seal {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    line-height: 1.2;
  }
`;

const Slots = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;

  .slot {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .k {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .slot input[type="text"],
  .slot > input {
    padding: 7px 9px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    color: var(--fg);
    font-size: var(--text-sm);
  }
  .accentedit {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .accentedit input[type="color"] {
    width: 32px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: transparent;
    cursor: pointer;
  }
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .add {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--accent);
    font-size: var(--text-xs);
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    cursor: pointer;
  }
`;
