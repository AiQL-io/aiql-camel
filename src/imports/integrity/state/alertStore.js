"use client";

import { useSyncExternalStore, useCallback } from "react";

export const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export const TYPE_LABEL = {
  impossible_parentage: "Impossible parentage",
  registry_biology_conflict: "Registry/biology conflict",
  missing_maternal: "Missing maternal",
  missing_paternal: "Missing paternal",
  duplicate_suspected: "Duplicate suspected",
  incomplete_profile: "Incomplete profile",
  hwe_anomaly: "HWE / panel anomaly",
  relatedness_conflict: "Relatedness conflict",
};

let alerts = [];
let seeded = false;
const listeners = new Set();

function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function snapshot() {
  return alerts;
}
function now() {
  return new Date().toISOString();
}

export function ensureSeeded(access) {
  if (seeded || !access) return;
  alerts = access.buildAlerts().map((a) => ({
    ...a,
    status: "open",
    assignee: null,
    resolutionNote: null,
    resolvedAt: null,
    notes: [],
    timeline: [{ action: "Detected", by: "system", at: a.detectedAt }],
  }));
  seeded = true;
}

function patch(id, p, log) {
  alerts = alerts.map((a) => {
    if (a.id !== id) return a;
    const next = { ...a, ...p };
    if (log) next.timeline = [...a.timeline, { ...log, at: now() }];
    return next;
  });
  emit();
}

export function assignAlert(id, who, by = "demo-user") {
  patch(id, { assignee: who }, { action: `Assigned to ${who}`, by });
}

export function setAlertStatus(id, status, by = "demo-user", note) {
  const p = { status };
  if (status === "resolved" || status === "dismissed") {
    p.resolvedAt = now();
    if (note) p.resolutionNote = note;
  }
  patch(id, p, {
    action: `Status → ${status}${note ? ` · ${note}` : ""}`,
    by,
  });
}

export function addAlertNote(id, text, by = "demo-user") {
  if (!text) return;
  const a = alerts.find((x) => x.id === id);
  if (!a) return;
  patch(
    id,
    { notes: [...a.notes, { author: by, text, at: now() }] },
    { action: "Note added", by },
  );
}

export function bulkAssign(ids, who, by = "demo-user") {
  ids.forEach((id) => assignAlert(id, who, by));
}
export function bulkDismiss(ids, reason, by = "demo-user") {
  ids.forEach((id) => setAlertStatus(id, "dismissed", by, reason));
}

export function useAlerts(access) {
  ensureSeeded(access);
  const list = useSyncExternalStore(subscribe, snapshot, () => alerts);
  return {
    alerts: list,
    getAlert: useCallback(
      (id) => list.find((a) => a.id === id) || null,
      [list],
    ),
    assignAlert,
    setAlertStatus,
    addAlertNote,
    bulkAssign,
    bulkDismiss,
  };
}
