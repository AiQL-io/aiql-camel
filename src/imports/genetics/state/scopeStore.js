"use client";

import { useSyncExternalStore, useCallback } from "react";

const EMPTY_FILTERS = {
  breed: "",
  region: "",
  ownerId: "",
  sex: "",
  status: "",
  ageMin: "",
  ageMax: "",
  bornFrom: "",
  bornTo: "",
};

let state = {
  scope: { kind: "all", filters: { ...EMPTY_FILTERS }, cohortId: null },
  audience: "analyst",
  cohorts: [],
};

let seq = 0;
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

export function setScopeAll() {
  state.scope = { kind: "all", filters: { ...EMPTY_FILTERS }, cohortId: null };
  emit();
}
export function setScopeFilters(filters) {
  state.scope = {
    kind: "filter",
    filters: { ...EMPTY_FILTERS, ...filters },
    cohortId: null,
  };
  emit();
}
export function setScopeCohort(cohortId) {
  state.scope = { kind: "cohort", filters: { ...EMPTY_FILTERS }, cohortId };
  emit();
}
export function setAudience(audience) {
  state.audience = audience;
  emit();
}
export function saveCohort(name, filters) {
  seq += 1;
  const id = `coh_${seq}`;
  state.cohorts = [
    ...state.cohorts,
    { id, name, filters: { ...filters }, created: Date.now() },
  ];
  emit();
  return id;
}
export function saveCohortIds(name, ids, origin) {
  seq += 1;
  const id = `coh_${seq}`;
  state.cohorts = [
    ...state.cohorts,
    {
      id,
      name,
      ids: [...new Set(ids)],
      origin: origin || null,
      created: Date.now(),
    },
  ];
  emit();
  return id;
}
export function updateCohort(id, patch) {
  state.cohorts = state.cohorts.map((c) =>
    c.id === id ? { ...c, ...patch } : c,
  );
  emit();
}
export function duplicateCohort(id) {
  const src = state.cohorts.find((c) => c.id === id);
  if (!src) return null;
  seq += 1;
  const newId = `coh_${seq}`;
  const copy = {
    ...src,
    id: newId,
    name: `${src.name} (copy)`,
    created: Date.now(),
  };
  state.cohorts = [...state.cohorts, copy];
  emit();
  return newId;
}
export function deleteCohort(id) {
  state.cohorts = state.cohorts.filter((c) => c.id !== id);
  if (state.scope.cohortId === id) setScopeAll();
  else emit();
}

export function animalsForCohort(access, cohort) {
  const all = access.animals.filter((a) => a.hasDNA);
  if (!cohort) return all;
  if (cohort.ids) {
    const set = new Set(cohort.ids);
    return all.filter((a) => set.has(a.id));
  }
  const f = { ...EMPTY_FILTERS, ...(cohort.filters || {}) };
  const num = (v) => (v === "" || v == null ? null : Number(v));
  const aMin = num(f.ageMin);
  const aMax = num(f.ageMax);
  const bFrom = num(f.bornFrom);
  const bTo = num(f.bornTo);
  return all.filter((a) => {
    if (f.breed && a.breed !== f.breed) return false;
    if (f.region && a.region !== f.region) return false;
    if (f.ownerId && a.ownerId !== f.ownerId) return false;
    if (f.sex && a.sex !== f.sex) return false;
    if (f.status && a.status !== f.status) return false;
    if (aMin != null && a.age < aMin) return false;
    if (aMax != null && a.age > aMax) return false;
    if (bFrom != null && a.birthYear < bFrom) return false;
    if (bTo != null && a.birthYear > bTo) return false;
    return true;
  });
}

export function resolveScope(access, st) {
  const all = access.animals.filter((a) => a.hasDNA);
  const sc = st.scope;
  let filters = sc.filters;
  let label = "Whole population";
  let cohortName = null;

  let idCohort = null;
  if (sc.kind === "cohort") {
    const coh = st.cohorts.find((c) => c.id === sc.cohortId);
    if (coh) {
      cohortName = coh.name;
      label = `Cohort · ${coh.name}`;
      if (coh.ids) idCohort = coh;
      else filters = coh.filters;
    }
  } else if (sc.kind === "filter") {
    label = "Filtered subset";
  }

  const num = (v) => (v === "" || v == null ? null : Number(v));
  const aMin = num(filters.ageMin);
  const aMax = num(filters.ageMax);
  const bFrom = num(filters.bornFrom);
  const bTo = num(filters.bornTo);

  const animals =
    sc.kind === "all"
      ? all
      : idCohort
        ? (() => {
            const set = new Set(idCohort.ids);
            return all.filter((a) => set.has(a.id));
          })()
        : all.filter((a) => {
          if (filters.breed && a.breed !== filters.breed) return false;
          if (filters.region && a.region !== filters.region) return false;
          if (filters.ownerId && a.ownerId !== filters.ownerId) return false;
          if (filters.sex && a.sex !== filters.sex) return false;
          if (filters.status && a.status !== filters.status) return false;
          if (aMin != null && a.age < aMin) return false;
          if (aMax != null && a.age > aMax) return false;
          if (bFrom != null && a.birthYear < bFrom) return false;
          if (bTo != null && a.birthYear > bTo) return false;
          return true;
        });

  const total = all.length || 1;
  const activeFilters = Object.entries(filters)
    .filter(([, v]) => v !== "" && v != null)
    .map(([k, v]) => ({ key: k, value: v }));

  return {
    animals,
    label,
    cohortName,
    kind: sc.kind,
    filters,
    activeFilters,
    n: animals.length,
    pctRegistry: Math.round((animals.length / total) * 100),
    tooSmall: animals.length < 30,
  };
}

export function serializeState(st) {
  const params = new URLSearchParams();
  const sc = (st && st.scope) || state.scope;
  const audience = (st && st.audience) || state.audience;

  params.set("scope", sc.kind);
  if (sc.kind === "filter") {
    Object.entries(sc.filters || {}).forEach(([k, v]) => {
      if (v !== "" && v != null) params.set(k, String(v));
    });
  } else if (sc.kind === "cohort" && sc.cohortId) {
    params.set("cohortId", sc.cohortId);
  }
  if (audience) params.set("audience", audience);

  return params.toString();
}

export function applyStateFromParams(params) {
  if (!params) return;
  const get = (k) =>
    typeof params.get === "function" ? params.get(k) : params[k];

  const audience = get("audience");
  if (audience) setAudience(audience);

  const kind = get("scope");
  if (kind === "cohort") {
    const cohortId = get("cohortId");
    if (cohortId) setScopeCohort(cohortId);
    else setScopeAll();
    return;
  }
  if (kind === "filter") {
    const filters = {};
    Object.keys(EMPTY_FILTERS).forEach((k) => {
      const v = get(k);
      if (v !== "" && v != null) filters[k] = v;
    });
    if (Object.keys(filters).length) setScopeFilters(filters);
    else setScopeAll();
    return;
  }
  if (kind === "all") setScopeAll();
}

export function useGeneticsState() {
  const st = useSyncExternalStore(subscribe, snapshot, () => state);
  return {
    state: st,
    scope: st.scope,
    audience: st.audience,
    cohorts: st.cohorts,
    resolve: useCallback((access) => resolveScope(access, st), [st]),
    setScopeAll,
    setScopeFilters,
    setScopeCohort,
    setAudience,
    saveCohort,
    saveCohortIds,
    updateCohort,
    duplicateCohort,
    deleteCohort,
  };
}
