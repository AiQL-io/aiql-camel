"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Button } from "@/imports/core/components/Button.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { DataTable } from "@/imports/core/components/DataTable.jsx";
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

  const columns = useMemo(
    () => [
      {
        id: "type",
        header: "Type",
        accessorFn: (r) => typeLabel(r.type),
        cell: (c) => <span className="muted">{c.getValue()}</span>,
      },
      {
        id: "subject",
        header: "Subject",
        accessorKey: "subjectLabel",
        cell: (c) => <span className="mono">{c.getValue()}</span>,
      },
      { id: "issuer", header: "Issuer", accessorKey: "generatedBy" },
      {
        id: "date",
        header: "Date",
        accessorKey: "generatedAt",
        cell: (c) => (
          <span className="mono">
            {new Date(c.getValue()).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "code",
        header: "Code",
        accessorKey: "verificationCode",
        cell: (c) => (
          <Link className="code" href={`/reports/verify/${c.getValue()}`}>
            {c.getValue()}
          </Link>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: (c) => (
          <span className={`status ${c.getValue()}`}>{c.getValue()}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        meta: { align: "end" },
        cell: (c) => {
          const r = c.row.original;
          if (!canIssue) return <span className="muted">—</span>;
          return r.status === "issued" ? (
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
          );
        },
      },
    ],
    [canIssue],
  );

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

      <CellStyles>
        <DataTable
          columns={columns}
          data={rows}
          pageSize={12}
          emptyMessage="No documents match these filters."
        />
      </CellStyles>
    </>
  );
}

const CellStyles = styled.div`
  .mono,
  .code {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
  .muted {
    color: var(--fg-secondary);
    font-size: var(--text-xs);
  }
  .code {
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
  .revoke,
  .reissue {
    border: 1px solid var(--border);
    background: var(--surface);
    border-radius: var(--radius-pill);
    padding: 3px 10px;
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .revoke {
    color: var(--danger);
  }
  .reissue {
    color: var(--accent);
  }
`;

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
