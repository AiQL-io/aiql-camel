"use client";

import { useSyncExternalStore } from "react";
import { ROLES } from "@/imports/core/providers/RoleProvider.jsx";

export const ROLE_DEFS = [
  { id: "geneticist", label: "Geneticist", org: "KFSH" },
  { id: "technician", label: "Lab Technician", org: "KFSH" },
  { id: "registrar", label: "Registrar", org: "Saudi Camel Club" },
  { id: "executive", label: "Director", org: "Saudi Camel Club" },
  { id: "admin", label: "Platform Admin", org: "AiQL" },
];

export const CAPABILITIES = [
  { key: "view", label: "View registry & profiles" },
  { key: "edit", label: "Add / edit camel records" },
  { key: "analysis", label: "Run parentage / relationship analysis" },
  { key: "popgen", label: "Run population-genetics analysis" },
  { key: "integrity", label: "Resolve integrity alerts & reconcile" },
  { key: "certs", label: "Generate / issue certificates" },
  { key: "manage", label: "Manage users, roles, panels, reference data" },
  { key: "export", label: "Export raw genotype data" },
];

const F = "full";
const V = "view";
const N = "none";
export const CAP_MATRIX = {
  view: { geneticist: F, technician: F, registrar: F, executive: F, admin: F },
  edit: { geneticist: F, technician: F, registrar: F, executive: N, admin: F },
  analysis: {
    geneticist: F,
    technician: F,
    registrar: F,
    executive: N,
    admin: F,
  },
  popgen: {
    geneticist: F,
    technician: V,
    registrar: V,
    executive: V,
    admin: F,
  },
  integrity: {
    geneticist: F,
    technician: N,
    registrar: F,
    executive: N,
    admin: F,
  },
  certs: { geneticist: F, technician: F, registrar: F, executive: N, admin: F },
  manage: {
    geneticist: N,
    technician: N,
    registrar: N,
    executive: N,
    admin: F,
  },
  export: {
    geneticist: F,
    technician: N,
    registrar: N,
    executive: N,
    admin: F,
  },
};

export function permissionsFor(roleId) {
  return CAPABILITIES.filter((c) => CAP_MATRIX[c.key][roleId] === F).map(
    (c) => c.label,
  );
}

let state = {
  users: [],
  audit: [],
  seeded: false,
  panel: null,
  building: false,
};
const listeners = new Set();

function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}
function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function snapshot() {
  return state;
}

const EXTRA_USERS = [
  { name: "Layla Al-Qahtani", roleId: "technician", org: "KFSH" },
  { name: "Khalid Al-Mutairi", roleId: "registrar", org: "Saudi Camel Club" },
  { name: "Sara Al-Ghamdi", roleId: "geneticist", org: "KFSH" },
];

const AUDIT_SEED = [
  {
    action: "Issued parentage certificate",
    entityType: "certificate",
    role: "registrar",
  },
  {
    action: "Resolved integrity alert",
    entityType: "alert",
    role: "geneticist",
  },
  { action: "Edited camel record", entityType: "camel", role: "technician" },
  {
    action: "Ran batch verification (whole registry)",
    entityType: "batch",
    role: "geneticist",
  },
  {
    action: "Reconciled registry vs biology",
    entityType: "alert",
    role: "registrar",
  },
  { action: "Created cohort", entityType: "cohort", role: "geneticist" },
  { action: "Exported genotype data", entityType: "export", role: "admin" },
  {
    action: "Changed user role",
    entityType: "user",
    role: "admin",
    before: "Lab Technician",
    after: "Registrar",
  },
  {
    action: "Validated marker panel",
    entityType: "panel",
    role: "admin",
    before: "Needs validation",
    after: "Validated",
  },
  {
    action: "Generated population report",
    entityType: "report",
    role: "geneticist",
  },
  { action: "Added camel record", entityType: "camel", role: "registrar" },
  {
    action: "Revoked certificate",
    entityType: "certificate",
    role: "registrar",
  },
  { action: "Switched active persona", entityType: "session", role: "admin" },
  {
    action: "Resolved integrity alert",
    entityType: "alert",
    role: "registrar",
  },
  {
    action: "Issued identity certificate",
    entityType: "certificate",
    role: "technician",
  },
  {
    action: "Edited reference data (regions)",
    entityType: "reference",
    role: "admin",
  },
];

function regId(access, i) {
  const a = access.animals[(i * 257) % access.animals.length];
  return a ? a.registrationId : `SCC-0000-${i}`;
}

export function ensureSeeded(access) {
  if (state.seeded || !access) return;
  const base = ROLES.map((r, i) => ({
    id: r.id,
    name: r.name,
    roleId: r.id,
    org: r.org,
    email: `${r.name.toLowerCase().replace(/[^a-z]+/g, ".")}@${
      r.org === "AiQL" ? "aiql.io" : r.org === "KFSH" ? "kfsh.med.sa" : "scc.sa"
    }`,
    status: "active",
    lastActive: new Date(Date.now() - i * 3600 * 1000).toISOString(),
    seed: true,
  }));
  const extra = EXTRA_USERS.map((u, i) => ({
    id: `usr_${i + 1}`,
    name: u.name,
    roleId: u.roleId,
    org: u.org,
    email: `${u.name.toLowerCase().replace(/[^a-z]+/g, ".")}@${
      u.org === "KFSH" ? "kfsh.med.sa" : "scc.sa"
    }`,
    status: i === 2 ? "invited" : "active",
    lastActive: new Date(Date.now() - (i + 6) * 7200 * 1000).toISOString(),
  }));

  const now = Date.now();
  const audit = AUDIT_SEED.map((a, i) => ({
    id: `aud_${i + 1}`,
    actorId: a.role,
    actorName: ROLE_DEFS.find((r) => r.id === a.role)?.label || a.role,
    action: a.action,
    entityType: a.entityType,
    entityId:
      a.entityType === "camel" || a.entityType === "certificate"
        ? regId(access, i)
        : a.entityType === "panel"
          ? access.panel.id
          : "—",
    before: a.before ?? null,
    after: a.after ?? null,
    timestamp: new Date(now - (i + 1) * 5400 * 1000).toISOString(),
  }));

  state = {
    ...state,
    users: [...base, ...extra],
    audit,
    seeded: true,
    panel: {
      validated: true,
      active: true,
      lastValidated: new Date(now - 86400000 * 5).toISOString(),
    },
  };
  emit();
}

export function logAudit(
  access,
  { actorId = "admin", action, entityType, entityId = "—", before, after },
) {
  const entry = {
    id: `aud_${state.audit.length + 1}_${Date.now()}`,
    actorId,
    actorName: ROLE_DEFS.find((r) => r.id === actorId)?.label || actorId,
    action,
    entityType,
    entityId,
    before: before ?? null,
    after: after ?? null,
    timestamp: new Date().toISOString(),
  };
  state = { ...state, audit: [entry, ...state.audit] };
  emit();
  return entry;
}

export function setUserRole(id, roleId, actorId = "admin") {
  const u = state.users.find((x) => x.id === id);
  const beforeRole = u ? ROLE_DEFS.find((r) => r.id === u.roleId)?.label : null;
  state = {
    ...state,
    users: state.users.map((x) => (x.id === id ? { ...x, roleId } : x)),
  };
  emit();
  if (u)
    logAudit(null, {
      actorId,
      action: `Changed role of ${u.name}`,
      entityType: "user",
      entityId: id,
      before: beforeRole,
      after: ROLE_DEFS.find((r) => r.id === roleId)?.label,
    });
}

export function setUserStatus(id, status, actorId = "admin") {
  const u = state.users.find((x) => x.id === id);
  state = {
    ...state,
    users: state.users.map((x) => (x.id === id ? { ...x, status } : x)),
  };
  emit();
  if (u)
    logAudit(null, {
      actorId,
      action: `Set ${u.name} status`,
      entityType: "user",
      entityId: id,
      before: u.status,
      after: status,
    });
}

let userSeq = 100;
export function addUser({ name, roleId, org }, actorId = "admin") {
  userSeq += 1;
  const id = `usr_new_${userSeq}`;
  const user = {
    id,
    name,
    roleId,
    org: org || ROLE_DEFS.find((r) => r.id === roleId)?.org || "KFSH",
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@kfsh.med.sa`,
    status: "invited",
    lastActive: null,
  };
  state = { ...state, users: [...state.users, user] };
  emit();
  logAudit(null, {
    actorId,
    action: `Invited user ${name} (${ROLE_DEFS.find((r) => r.id === roleId)?.label})`,
    entityType: "user",
    entityId: id,
  });
  return user;
}

export function validatePanel(panelId, actorId = "admin") {
  state = {
    ...state,
    panel: {
      ...state.panel,
      validated: true,
      lastValidated: new Date().toISOString(),
    },
  };
  emit();
  logAudit(null, {
    actorId,
    action: "Validated marker panel",
    entityType: "panel",
    entityId: panelId,
  });
}

export function setBuilding(v) {
  state = { ...state, building: v };
  emit();
}

export function useAdmin(access) {
  ensureSeeded(access);
  return useSyncExternalStore(subscribe, snapshot, () => state);
}
