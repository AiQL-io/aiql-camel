"use client";

import React from "react";
import styled from "styled-components";

export function CaseSubjects({ subjects, stats }) {
  return (
    <>
      <Subjects>
        {["offspring", "sire", "dam"].map((role) =>
          subjects[role] ? (
            <div className="subj" key={role}>
              <span className="role">{role}</span>
              <span className="nm">{subjects[role].name}</span>
              <span className="reg">{subjects[role].reg}</span>
            </div>
          ) : null,
        )}
      </Subjects>

      <Stats>
        <Stat k="Loci" v={stats.lociCompared ?? "—"} />
        <Stat k="Mismatches" v={stats.mismatchCount ?? "—"} />
        <Stat k="CPE" v={stats.cpe ?? "—"} />
      </Stats>
    </>
  );
}

function Stat({ k, v }) {
  return (
    <div className="stat">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

const Subjects = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 16px;
  flex-wrap: wrap;

  .subj .role {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .subj .nm {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    margin-top: 2px;
  }
  .subj .reg {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--separator);

  .stat .k {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
  }
  .stat .v {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
    margin-top: 3px;
  }
`;
