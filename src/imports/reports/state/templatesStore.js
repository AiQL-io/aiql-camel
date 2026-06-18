"use client";

import { useSyncExternalStore } from "react";
import { TEMPLATES } from "@/imports/reports/engine/reports.js";

let templates = TEMPLATES.map((t) => ({ ...t }));
let seq = 0;
const listeners = new Set();

function emit() {
  templates = [...templates];
  listeners.forEach((l) => l());
}
function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function snapshot() {
  return templates;
}

export function updateTemplate(id, patch) {
  templates = templates.map((t) => (t.id === id ? { ...t, ...patch } : t));
  emit();
}

export function addTemplate() {
  seq += 1;
  const id = `tpl_custom_${seq}`;
  templates = [
    ...templates,
    {
      id,
      name: `Custom template ${seq}`,
      brand: "Manhal",
      accent: "#1f6feb",
      seal: "Custom issuing seal",
    },
  ];
  emit();
  return id;
}

export function useTemplates() {
  return useSyncExternalStore(subscribe, snapshot, () => templates);
}
