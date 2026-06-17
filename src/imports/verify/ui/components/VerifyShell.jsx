"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { useCases } from "@/imports/verify/state/caseStore.js";

const NAV = [
  { href: "/verify", label: "Workbench", exact: true },
  { href: "/verify/search", label: "Reverse Search" },
  { href: "/verify/relationship", label: "Relationships" },
  { href: "/verify/batch", label: "Batch & Audit" },
  { href: "/verify/cases", label: "Cases" },
];

const STATUS_TONE = {
  draft: "default",
  review: "warning",
  approved: "success",
  rejected: "danger",
};

export function VerifyShell({ children }) {
  const pathname = usePathname();
  const { activeCase, setActiveCase } = useCases();

  return (
    <Wrap>
      <header className="vh">
        <div>
          <Overline>Parentage &amp; relationship intelligence</Overline>
          <h1>Verification</h1>
        </div>
        <CaseBar>
          {activeCase ? (
            <>
              <span className="lbl">Active case</span>
              <Link href="/verify/cases" className="case">
                {activeCase.number}
              </Link>
              <Chip
                size="sm"
                tone={STATUS_TONE[activeCase.status]}
                style={{ textTransform: "capitalize" }}
              >
                {activeCase.status}
              </Chip>
              <button
                type="button"
                onClick={() => setActiveCase(null)}
                title="Detach case"
              >
                <Icon name="x" size={13} />
              </button>
            </>
          ) : (
            <span className="none">No active case</span>
          )}
        </CaseBar>
      </header>

      <nav className="subnav">
        {NAV.map((n) => {
          const active = n.exact
            ? pathname === n.href
            : pathname.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={active ? "on" : ""}>
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="body">{children}</div>
    </Wrap>
  );
}

const Wrap = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 40px 96px 128px;
  animation: aiql-fade-in 220ms ease-out;

  .vh {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .vh h1 {
    font-size: var(--text-2xl);
    line-height: 40px;
    font-weight: var(--weight-medium);
    letter-spacing: -0.02em;
    margin-top: 8px;
  }
  .subnav {
    display: flex;
    gap: 4px;
    margin-top: 20px;
    border-bottom: 1px solid var(--border);
  }
  .subnav a {
    padding: 10px 14px;
    font-size: var(--text-sm);
    color: var(--fg-subtle);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
  }
  .subnav a:hover {
    color: var(--fg);
  }
  .subnav a.on {
    color: var(--accent);
    border-bottom-color: var(--accent);
    font-weight: var(--weight-medium);
  }
  .body {
    margin-top: 24px;
  }
`;

const CaseBar = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 6px 0 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface);

  .lbl {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .case {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--accent);
    font-weight: var(--weight-medium);
  }
  .none {
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: var(--fg-subtle);
    cursor: pointer;
    border-radius: var(--radius-pill);
  }
  button:hover {
    background: var(--surface-2);
  }
`;
