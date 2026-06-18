"use client";

import { useSyncExternalStore } from "react";

let openKey = null;
const listeners = new Set();

function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function snapshot() {
  return openKey;
}

export function openMethod(key) {
  openKey = key;
  emit();
}
export function closeMethod() {
  openKey = null;
  emit();
}

export function useMethod() {
  const key = useSyncExternalStore(subscribe, snapshot, () => openKey);
  return { openKey: key, openMethod, closeMethod };
}
