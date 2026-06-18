"use client";

import { useSyncExternalStore } from "react";
import {
  REPORT_TYPES,
  buildReportContent,
  generateVerificationCode,
} from "@/imports/reports/engine/reports.js";

let reports = [];
let seeded = false;
let seq = 0;
const listeners = new Set();

function emit() {
  reports = [...reports];
  listeners.forEach((l) => l());
}
function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function snapshot() {
  return reports;
}

const ISSUERS = ["R. Al-Otaibi", "Dr. S. Nasser", "KFSH Lab", "M. Al-Harbi"];

export function ensureSeeded(access) {
  if (seeded || !access) return;
  const dnaAnimals = access.animals.filter((a) => a.hasDNA);
  const pick = (i) => dnaAnimals[(i * 137) % dnaAnimals.length];
  const seeds = [];
  // A spread of historical issued documents.
  for (let i = 0; i < 6; i++) {
    const a = pick(i);
    if (!a) continue;
    seeds.push({ type: "identity_certificate", subjectIds: [a.id] });
  }
  for (let i = 0; i < 4; i++) {
    const a = pick(i + 9);
    if (!a || !a._trueSireId || !a._trueDamId) continue;
    seeds.push({
      type: "parentage_certificate",
      subjectIds: [a.id, a._trueSireId, a._trueDamId],
    });
  }
  seeds.push({ type: "population_report", subjectIds: [] });
  seeds.push({ type: "integrity_report", subjectIds: [] });

  const base = Date.now();
  reports = seeds.map((s, i) => {
    const content = buildReportContent(access, s.type, s.subjectIds);
    seq += 1;
    return {
      id: `rep_${seq}`,
      type: s.type,
      subjectIds: s.subjectIds,
      subjectLabel: content ? content.subjectLabel : "—",
      templateId: "manhal_official",
      generatedBy: ISSUERS[i % ISSUERS.length],
      generatedAt: new Date(base - (i + 1) * 86400000 * 3).toISOString(),
      verificationCode: generateVerificationCode(s.type + i),
      status: i === 2 ? "revoked" : "issued",
    };
  });
  seeded = true;
  emit();
}

export function issueReport({
  access,
  type,
  subjectIds,
  templateId,
  generatedBy = "demo-user",
}) {
  const content = buildReportContent(access, type, subjectIds);
  seq += 1;
  const rec = {
    id: `rep_${seq}`,
    type,
    subjectIds,
    subjectLabel: content ? content.subjectLabel : "—",
    templateId,
    generatedBy,
    generatedAt: new Date().toISOString(),
    verificationCode: generateVerificationCode(type + seq),
    status: "issued",
  };
  reports = [rec, ...reports];
  emit();
  return rec;
}

export function batchIssueIdentity({
  access,
  regIds,
  templateId = "manhal_official",
  generatedBy = "demo-user",
}) {
  const byReg = new Map(
    access.animals.map((a) => [a.registrationId.toUpperCase(), a]),
  );
  const records = [];
  const unmatched = [];
  for (const raw of regIds) {
    const key = raw.trim().toUpperCase();
    if (!key) continue;
    const a = byReg.get(key);
    if (!a || !a.hasDNA) {
      unmatched.push(raw.trim());
      continue;
    }
    records.push(
      issueReport({
        access,
        type: "identity_certificate",
        subjectIds: [a.id],
        templateId,
        generatedBy,
      }),
    );
  }
  return { issued: records.length, unmatched, records };
}

export function revokeReport(id) {
  reports = reports.map((r) => (r.id === id ? { ...r, status: "revoked" } : r));
  emit();
}

export function reissueReport(id) {
  const src = reports.find((r) => r.id === id);
  if (!src) return null;
  seq += 1;
  const rec = {
    ...src,
    id: `rep_${seq}`,
    status: "issued",
    generatedAt: new Date().toISOString(),
    verificationCode: generateVerificationCode(src.type + seq),
  };
  reports = [rec, ...reports];
  emit();
  return rec;
}

export function findByCode(code) {
  if (!code) return null;
  const norm = code.trim().toUpperCase();
  return reports.find((r) => r.verificationCode.toUpperCase() === norm) || null;
}

export function typeLabel(type) {
  return REPORT_TYPES.find((t) => t.id === type)?.label || type;
}

export function useReports(access) {
  ensureSeeded(access);
  return useSyncExternalStore(subscribe, snapshot, () => reports);
}
