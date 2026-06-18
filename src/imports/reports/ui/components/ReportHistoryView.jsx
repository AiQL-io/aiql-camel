"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { REPORT_TYPES } from "@/imports/reports/engine/reports.js";
import {
  useReports,
  revokeReport,
  reissueReport,
  batchIssueIdentity,
  typeLabel,
} from "@/imports/reports/state/reportsStore.js";

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  ...REPORT_TYPES.map((t) => ({ value: t.id, label: t.label })),
];
const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "issued", label: "Issued" },
  { value: "revoked", label: "Revoked" },
];

export function ReportHistoryView({ access }) {
  const reports = useReports(access);
  const { can } = useRole();
  const canIssue = can("issueCertificate");
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchText, setBatchText] = useState("");
  const [batchResult, setBatchResult] = useState(null);

  const runBatch = () => {
    const regIds = batchText.split(/[\s,;]+/).filter(Boolean);
    const res = batchIssueIdentity({ access, regIds });
    setBatchResult(res);
  };

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return reports.filter((r) => {
      if (type && r.type !== type) return false;
      if (status && r.status !== status) return false;
      if (
        needle &&
        !r.subjectLabel.toLowerCase().includes(needle) &&
        !r.verificationCode.toLowerCase().includes(needle) &&
        !r.generatedBy.toLowerCase().includes(needle)
      )
        return false;
      return true;
    });
  }, [reports, q, type, status]);

  const issuedCount = reports.filter((r) => r.status === "issued").length;

  return (
    <>
      <Toolbar>
        <div className="grp">
          <input
            placeholder="Search subject, code, or issuer…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select
            size="sm"
            value={type}
            onChange={setType}
            options={TYPE_OPTIONS}
          />
          <Select
            size="sm"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="grp">
          <span className="count">
            {issuedCount} issued · {reports.length} total
          </span>
          {canIssue && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setBatchOpen((o) => !o)}
              leadingIcon={<Icon name="stack" size={14} />}
            >
              Batch issue
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            as={Link}
            href="/verify/batch"
            leadingIcon={<Icon name="git-fork" size={14} />}
          >
            Batch verification
          </Button>
        </div>
      </Toolbar>

      {batchOpen && (
        <BatchPanel>
          <div className="bhead">
            <b>Batch-issue identity certificates</b>
            <span>
              Paste registration IDs (comma, space, or newline separated). A
              certificate is issued for each profiled match.
            </span>
          </div>
          <textarea
            placeholder="SCC-2015-00505, SCC-2008-00138 …"
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
          />
          <div className="brow">
            <Button
              size="sm"
              variant="primary"
              onClick={runBatch}
              leadingIcon={<Icon name="seal-check" size={14} />}
            >
              Issue certificates
            </Button>
            {batchResult && (
              <span className="bres">
                Issued <b>{batchResult.issued}</b>
                {batchResult.unmatched.length > 0 &&
                  ` · ${batchResult.unmatched.length} unmatched`}
              </span>
            )}
          </div>
        </BatchPanel>
      )}

      <Card padding={0}>
        <Table>
          <div className="thead">
            <span>Type</span>
            <span>Subject</span>
            <span>Issuer</span>
            <span>Date</span>
            <span>Code</span>
            <span>Status</span>
            <span className="ar">Actions</span>
          </div>
          <div className="tbody">
            {rows.map((r) => (
              <div className="trow" key={r.id}>
                <span className="t">{typeLabel(r.type)}</span>
                <span className="subj">{r.subjectLabel}</span>
                <span className="t">{r.generatedBy}</span>
                <span className="mono">
                  {new Date(r.generatedAt).toLocaleDateString()}
                </span>
                <Link
                  className="code"
                  href={`/reports/verify/${r.verificationCode}`}
                >
                  {r.verificationCode}
                </Link>
                <span className={`status ${r.status}`}>{r.status}</span>
                <span className="acts">
                  {!canIssue ? (
                    <span className="muted">—</span>
                  ) : r.status === "issued" ? (
                    <button
                      type="button"
                      className="revoke"
                      onClick={() => revokeReport(r.id)}
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="reissue"
                      onClick={() => reissueReport(r.id)}
                    >
                      Reissue
                    </button>
                  )}
                </span>
              </div>
            ))}
            {rows.length === 0 && (
              <div className="empty">No documents match these filters.</div>
            )}
          </div>
        </Table>
      </Card>
    </>
  );
}

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;

  .grp {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  input {
    width: 260px;
    max-width: 50vw;
    padding: 7px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    color: var(--fg);
    font-size: var(--text-sm);
  }
  .count {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    font-family: var(--font-mono);
  }
`;

const BatchPanel = styled.div`
  margin-bottom: 16px;
  padding: 14px;
  border: 1px solid var(--accent);
  background: var(--accent-soft);
  border-radius: var(--radius-lg);

  .bhead {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 10px;
  }
  .bhead b {
    font-size: var(--text-sm);
  }
  .bhead span {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  textarea {
    width: 100%;
    min-height: 64px;
    resize: vertical;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
  .brow {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
  }
  .bres {
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  .bres b {
    color: var(--status-success);
  }
`;

const Table = styled.div`
  .thead,
  .trow {
    display: grid;
    grid-template-columns: 1.4fr 1.4fr 1fr 0.9fr 1.2fr 0.8fr 0.9fr;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
  }
  .thead {
    background: var(--bg-muted, var(--surface-2));
    border-bottom: 1px solid var(--border);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .thead .ar {
    text-align: end;
  }
  .trow {
    border-bottom: 1px solid var(--separator);
    font-size: var(--text-sm);
  }
  .trow:hover {
    background: var(--surface-2);
  }
  .t {
    color: var(--fg-secondary);
    font-size: var(--text-xs);
  }
  .subj {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .code {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .status {
    font-size: var(--text-xs);
    text-transform: capitalize;
  }
  .status.issued {
    color: var(--status-success);
  }
  .status.revoked {
    color: var(--danger);
  }
  .acts {
    text-align: end;
  }
  .acts button {
    border: 1px solid var(--border);
    background: var(--surface);
    border-radius: var(--radius-pill);
    padding: 3px 10px;
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .acts .revoke {
    color: var(--danger);
  }
  .acts .reissue {
    color: var(--accent);
  }
  .acts .muted {
    color: var(--fg-subtle);
  }
  .empty {
    padding: 28px;
    text-align: center;
    color: var(--fg-subtle);
    font-size: var(--text-sm);
  }
`;
