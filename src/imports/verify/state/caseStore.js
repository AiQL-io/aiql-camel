"use client";

import { useSyncExternalStore, useCallback } from "react";

let cases = [];
let activeCaseId = null;
let seq = 0;
const listeners = new Set();

function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function snapshot() {
  return cases;
}

function now() {
  return new Date().toISOString();
}

function caseCode() {
  seq += 1;
  const yr = new Date().getFullYear();
  return {
    id: `case_${seq}`,
    number: `VC-${yr}-${String(seq).padStart(4, "0")}`,
  };
}

export function createCase({
  type,
  subjects,
  verdict,
  stats,
  evidence,
  createdBy = "demo-user",
}) {
  const { id, number } = caseCode();
  const c = {
    id,
    number,
    type,
    subjects,
    verdict,
    stats: stats || {},
    evidence: evidence || {},
    status: "draft",
    assignee: createdBy,
    notes: [],
    timeline: [{ action: "Case created", by: createdBy, at: now() }],
    certificate: null,
    alertRaised: false,
    createdBy,
    createdAt: now(),
    updatedAt: now(),
  };
  cases = [c, ...cases];
  activeCaseId = id;
  emit();
  return c;
}

function patchCase(id, patch, logEntry) {
  cases = cases.map((c) => {
    if (c.id !== id) return c;
    const next = { ...c, ...patch, updatedAt: now() };
    if (logEntry) next.timeline = [...c.timeline, { ...logEntry, at: now() }];
    return next;
  });
  emit();
}

const FLOW = {
  draft: ["review"],
  review: ["approved", "rejected"],
  approved: ["review"],
  rejected: ["review"],
};

export function canTransition(from, to) {
  return (FLOW[from] || []).includes(to);
}

export function transitionCase(id, to, by = "demo-user") {
  const c = cases.find((x) => x.id === id);
  if (!c || !canTransition(c.status, to)) return;
  patchCase(id, { status: to }, { action: `Status → ${to}`, by });
}

export function addNote(id, text, by = "demo-user") {
  if (!text) return;
  const c = cases.find((x) => x.id === id);
  if (!c) return;
  patchCase(
    id,
    { notes: [...c.notes, { author: by, text, at: now() }] },
    { action: "Note added", by },
  );
}

export function issueCertificate(id, by = "demo-user") {
  const c = cases.find((x) => x.id === id);
  if (!c || c.status !== "approved") return;
  const code = `MANHAL-${c.number}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  patchCase(
    id,
    { certificate: { code, issuedAt: now(), revoked: false } },
    { action: "Certificate issued", by },
  );
}

export function revokeCertificate(id, by = "demo-user") {
  const c = cases.find((x) => x.id === id);
  if (!c || !c.certificate) return;
  patchCase(
    id,
    { certificate: { ...c.certificate, revoked: true } },
    { action: "Certificate revoked", by },
  );
}

export function raiseAlert(id, by = "demo-user") {
  patchCase(
    id,
    { alertRaised: true },
    { action: "Integrity alert raised", by },
  );
}

export function setActiveCase(id) {
  activeCaseId = id;
  emit();
}
function activeSnapshot() {
  return activeCaseId;
}

export function useCases() {
  const list = useSyncExternalStore(subscribe, snapshot, () => cases);
  const active = useSyncExternalStore(subscribe, activeSnapshot, () => null);
  return {
    cases: list,
    activeCase: list.find((c) => c.id === active) || null,
    setActiveCase: useCallback((id) => setActiveCase(id), []),
    createCase,
    transitionCase,
    addNote,
    issueCertificate,
    revokeCertificate,
    raiseAlert,
    canTransition,
  };
}
