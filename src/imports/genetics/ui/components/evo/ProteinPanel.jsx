"use client";

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { buildProteinPdb } from "@/imports/genetics/data/evoMock.js";

let molPromise = null;
function load3Dmol() {
  if (typeof window === "undefined")
    return Promise.reject(new Error("no window"));
  if (window.$3Dmol) return Promise.resolve(window.$3Dmol);
  if (molPromise) return molPromise;
  molPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/3dmol@2.4.2/build/3Dmol-min.js";
    s.async = true;
    s.onload = () => resolve(window.$3Dmol);
    s.onerror = () => reject(new Error("3Dmol load failed"));
    document.head.appendChild(s);
  });
  return molPromise;
}

const PDB_IDS = [
  "1ubq",
  "1crn",
  "3chy",
  "1pga",
  "2trx",
  "1mbn",
  "1bpi",
  "1ctf",
  "1aki",
  "256b",
];
function pickPdb(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return PDB_IDS[Math.abs(h) % PDB_IDS.length];
}

function styleStructure(v, residue, maxResi) {
  v.setStyle({}, { cartoon: { color: "#2f9163" } });
  if (residue == null || maxResi <= 0) {
    v.zoomTo({}, 300);
    return;
  }
  const resi = (((residue % maxResi) + maxResi) % maxResi) + 1;
  v.addStyle(
    { byres: true, within: { distance: 4.5, sel: { resi } } },
    {
      stick: { radius: 0.13, colorscheme: "whiteCarbon" },
      sphere: { scale: 0.18, colorscheme: "whiteCarbon" },
    },
  );
  v.setStyle(
    { resi },
    {
      cartoon: { color: "#39e07a" },
      stick: { radius: 0.3, color: "#39e07a" },
      sphere: { scale: 0.28, color: "#39e07a" },
    },
  );
  v.zoomTo({ within: { distance: 7, sel: { resi } } }, 500);
}

export function ProteinPanel({ result, selectedOrf, selResidue, pngRef }) {
  const ref = useRef(null);
  const viewerRef = useRef(null);
  const reqRef = useRef(0);
  const maxResiRef = useRef(1);
  const readyRef = useRef(false);
  const isRealRef = useRef(false);
  const selResRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const orf = selectedOrf != null ? result.orfs[selectedOrf] : null;

  useEffect(() => {
    selResRef.current = selResidue;
    const v = viewerRef.current;
    if (v && readyRef.current && isRealRef.current) {
      styleStructure(v, selResidue, maxResiRef.current);
      v.render();
    }
  }, [selResidue]);

  useEffect(() => {
    if (!pngRef) return undefined;
    pngRef.current = () => {
      const v = viewerRef.current;
      if (!v || !readyRef.current) return null;
      try {
        v.render();
        return v.pngURI();
      } catch (e) {
        return null;
      }
    };
    return () => {
      if (pngRef) pngRef.current = null;
    };
  }, [pngRef]);

  useEffect(() => {
    if (!orf || !ref.current) return undefined;
    let cancelled = false;
    const myReq = ++reqRef.current;
    setStatus("loading");
    load3Dmol()
      .then(($3Dmol) => {
        if (cancelled || !ref.current || myReq !== reqRef.current) return;
        if (viewerRef.current && viewerRef.current.__el !== ref.current) {
          ref.current.innerHTML = "";
          viewerRef.current = null;
        }
        if (!viewerRef.current) {
          viewerRef.current = $3Dmol.createViewer(ref.current, {
            backgroundColor: "#f7f9fc",
            preserveDrawingBuffer: true,
          });
          viewerRef.current.__el = ref.current;
        }
        const v = viewerRef.current;
        v.clear();
        const seed = `${result.organism}:${selectedOrf}`;
        let done = false;
        const finish = () => {
          if (cancelled || myReq !== reqRef.current) return;
          setStatus("ready");
        };
        const fallback = () => {
          if (done || cancelled || myReq !== reqRef.current) return;
          done = true;
          isRealRef.current = false;
          v.clear();
          v.addModel(buildProteinPdb(orf.aa, seed), "pdb");
          v.setStyle(
            {},
            { cartoon: { style: "trace", color: "#1f7a4d", thickness: 0.9 } },
          );
          v.resize();
          v.zoomTo();
          v.rotate(90, "x");
          v.render();
          readyRef.current = true;
          finish();
        };
        const timer = setTimeout(fallback, 6000);
        try {
          $3Dmol.download(`pdb:${pickPdb(seed)}`, v, {}, () => {
            if (done || cancelled || myReq !== reqRef.current) return;
            let atoms = 0;
            try {
              atoms = v.getModel().selectedAtoms({}).length;
            } catch (e) {
              atoms = 0;
            }
            if (!atoms) {
              clearTimeout(timer);
              fallback();
              return;
            }
            done = true;
            clearTimeout(timer);
            isRealRef.current = true;
            let maxR = 1;
            try {
              v.getModel()
                .selectedAtoms({})
                .forEach((a) => {
                  if (a.resi > maxR) maxR = a.resi;
                });
            } catch (e) {
              maxR = 1;
            }
            maxResiRef.current = maxR;
            v.resize();
            styleStructure(v, selResRef.current, maxR);
            v.render();
            readyRef.current = true;
            finish();
          });
        } catch (e) {
          clearTimeout(timer);
          fallback();
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [orf, selectedOrf, result]);

  return (
    <Protein>
      {!orf ? (
        <div className="empty">
          To view structure, click &amp; drag sequence or click protein sequence
          (ORF)
        </div>
      ) : (
        <>
          <div className="stage">
            <div className="viewer" ref={ref} />
            {status === "loading" && (
              <div className="load">Folding structure…</div>
            )}
            {status === "error" && (
              <div className="load">3D viewer needs a connection to load.</div>
            )}
            <span className="axis" aria-hidden="true" />
          </div>
          <div className="cap">
            ESMFold structure · {orf.aa.replace(/\*$/, "").length} residues ·
            illustrative (drag to rotate, scroll to zoom)
          </div>
        </>
      )}
    </Protein>
  );
}

const Protein = styled.div`
  padding: 14px 18px;

  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 520px;
    padding: 0 20px;
    text-align: center;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    border: 1px dashed var(--border);
    border-radius: var(--radius-md);
  }
  .stage {
    position: relative;
    height: 520px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: #f7f9fc;
  }
  .viewer {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .viewer canvas {
    border-radius: var(--radius-md);
  }
  .load {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    pointer-events: none;
  }
  .axis {
    position: absolute;
    left: 8px;
    bottom: 8px;
    width: 22px;
    height: 22px;
    pointer-events: none;
    background:
      linear-gradient(90deg, #d64545 0 60%, transparent 60%) left center / 14px
        2px no-repeat,
      linear-gradient(0deg, #3a8f54 0 60%, transparent 60%) left bottom / 2px
        14px no-repeat,
      radial-gradient(
        circle 2px at 1px calc(100% - 1px),
        #2e7efc 0 100%,
        transparent 100%
      );
  }
  .cap {
    display: block;
    margin-top: 8px;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
`;
