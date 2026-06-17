"use client";

import React from "react";
import styled from "styled-components";

export function CompareStrip({ rows = [] }) {
  const loci = [];
  const seen = new Set();
  for (const r of rows)
    for (const g of r.geno)
      if (!seen.has(g.locus)) {
        seen.add(g.locus);
        loci.push(g.locus);
      }

  const mapOf = (r) => {
    const m = {};
    for (const g of r.geno) m[g.locus] = [g.alleleA, g.alleleB];
    return m;
  };
  const maps = rows.map(mapOf);

  const shareInfo = loci.map((locus) => {
    const present = maps.filter((m) => m[locus]);
    if (present.length < 2) return { shared: new Set(), opposition: false };
    const sets = present.map((m) => new Set(m[locus]));
    let shared = sets[0];
    for (let i = 1; i < sets.length; i++)
      shared = new Set([...shared].filter((x) => sets[i].has(x)));
    return { shared, opposition: shared.size === 0 };
  });

  const oppositionCount = shareInfo.filter((s) => s.opposition).length;
  const comparedLoci = shareInfo.filter(
    (s, i) => maps.filter((m) => m[loci[i]]).length >= 2,
  ).length;

  return (
    <Wrap>
      <div className="scroll">
        <Grid $cols={loci.length}>
          <div className="corner" />
          {loci.map((l, i) => (
            <div
              key={l}
              className={`loc ${shareInfo[i].opposition ? "opp" : ""}`}
            >
              {l}
            </div>
          ))}
          {rows.map((r, ri) => (
            <React.Fragment key={ri}>
              <div className="track">
                <span className="tlabel">{r.label}</span>
                {r.sub && <span className="tsub">{r.sub}</span>}
              </div>
              {loci.map((l, i) => {
                const pair = maps[ri][l];
                const sh = shareInfo[i];
                if (!pair)
                  return (
                    <div key={l} className="cell empty">
                      —
                    </div>
                  );
                return (
                  <div key={l} className={`cell ${sh.opposition ? "opp" : ""}`}>
                    {pair.map((a, ai) => (
                      <span
                        key={ai}
                        className={sh.shared.has(a) ? "al shared" : "al"}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </Grid>
      </div>
      {rows.length >= 2 && (
        <Summary>
          <span>
            <b>{comparedLoci}</b> loci compared
          </span>
          <span className={oppositionCount > 2 ? "bad" : ""}>
            <b>{oppositionCount}</b> opposition
            {oppositionCount === 1 ? "" : "s"}
          </span>
          <span className="legend">
            <i className="sw shared" /> shared allele
            <i className="sw opp" /> opposition locus
          </span>
        </Summary>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  width: 100%;
  min-width: 0;
  max-width: 100%;

  .scroll {
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    max-width: 100%;
    padding-bottom: 4px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 120px repeat(${(p) => p.$cols}, minmax(52px, 1fr));
  gap: 4px;
  min-width: max-content;

  .corner {
    background: transparent;
  }
  .loc {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--fg-subtle);
    text-align: center;
    padding: 2px 0;
    white-space: nowrap;
  }
  .loc.opp {
    color: var(--danger);
  }
  .track {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .track .tlabel {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
  }
  .track .tsub {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--fg-subtle);
  }
  .cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 2px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }
  .cell.opp {
    border-color: var(--danger);
    background: color-mix(in srgb, var(--danger) 8%, var(--surface));
  }
  .cell.empty {
    color: var(--fg-muted);
    justify-content: center;
    font-family: var(--font-mono);
  }
  .al {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .al.shared {
    color: var(--accent);
    font-weight: var(--weight-medium);
  }
`;

const Summary = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  font-size: var(--text-xs);
  color: var(--fg-secondary);
  flex-wrap: wrap;

  b {
    font-family: var(--font-mono);
    color: var(--fg);
  }
  .bad b {
    color: var(--danger);
  }
  .legend {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--fg-subtle);
    margin-inline-start: auto;
  }
  .sw {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    display: inline-block;
  }
  .sw.shared {
    background: var(--accent);
  }
  .sw.opp {
    background: var(--danger);
    margin-inline-start: 8px;
  }
`;
