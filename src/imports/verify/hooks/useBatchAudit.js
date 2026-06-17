"use client";

import { useState, useRef, useCallback } from "react";

const CHUNK = 250;
const TICK_MS = 30;

function initialIds() {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("ids");
  if (!raw) return null;
  return raw.split(",").filter(Boolean);
}

export function useBatchAudit(access) {
  const [scope, setScope] = useState("sire");
  const [region, setRegion] = useState("");
  const [breed, setBreed] = useState("");
  const [owner, setOwner] = useState("");
  const [tolerance, setTolerance] = useState(1);
  const [verdictFilter, setVerdictFilter] = useState("");

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasRun, setHasRun] = useState(false);

  const [selectionIds] = useState(initialIds);
  const timer = useRef(null);
  const edgesRef = useRef([]);
  const cursorRef = useRef(0);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRunning(false);
  }, []);

  const run = useCallback(() => {
    stop();
    const base = selectionIds || access.animals.map((a) => a.id);
    const ids = base.filter((id) => {
      const a = access.getAnimal(id);
      return (
        a &&
        (!region || a.region === region) &&
        (!breed || a.breed === breed) &&
        (!owner || a.ownerId === owner)
      );
    });
    const edges = access.buildAuditEdges({ scope, ids });
    edgesRef.current = edges;
    cursorRef.current = 0;
    setResults([]);
    setTotal(edges.length);
    setHasRun(true);
    setRunning(true);

    timer.current = setInterval(() => {
      const start = cursorRef.current;
      const chunk = edges.slice(start, start + CHUNK);
      // genuine incremental compute — verdicts produced here, not pre-computed
      const { results: chunkRes } = access.auditEdgeList(chunk, { tolerance });
      cursorRef.current = start + chunk.length;
      setResults((prev) => prev.concat(chunkRes));
      if (cursorRef.current >= edges.length) {
        clearInterval(timer.current);
        timer.current = null;
        setRunning(false);
      }
    }, TICK_MS);
  }, [access, scope, region, breed, owner, tolerance, stop, selectionIds]);

  const cancel = useCallback(() => stop(), [stop]);

  const revealed = results.length;
  const progress = total ? revealed / total : 0;
  const summary = results.reduce(
    (s, r) => {
      s[r.verdict] = (s[r.verdict] || 0) + 1;
      return s;
    },
    { consistent: 0, inconclusive: 0, excluded: 0, "not-testable": 0 },
  );
  const rows = verdictFilter
    ? results.filter((r) => r.verdict === verdictFilter)
    : results;

  return {
    scope,
    setScope,
    region,
    setRegion,
    breed,
    setBreed,
    owner,
    setOwner,
    tolerance,
    setTolerance,
    verdictFilter,
    setVerdictFilter,
    facets: access.facets,
    source: selectionIds
      ? `selection (${selectionIds.length})`
      : "whole registry",
    run,
    cancel,
    running,
    progress,
    revealed,
    total,
    summary,
    rows,
    hasRun,
  };
}
