"use client";

import { useSyncExternalStore } from "react";

let open = false;
const listeners = new Set();

function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function snapshot() {
  return open;
}

export function openCommandCenter() {
  open = true;
  emit();
}
export function closeCommandCenter() {
  open = false;
  emit();
}
export function toggleCommandCenter() {
  open = !open;
  emit();
}

export function useCommandCenterOpen() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
