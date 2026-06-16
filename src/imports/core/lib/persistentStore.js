"use client";

export function createPersistentStore({
  storageKey,
  serverValue,
  readInitial,
  persist,
}) {
  let current;
  const listeners = new Set();

  function getSnapshot() {
    if (current === undefined) current = readInitial();
    return current;
  }

  function getServerSnapshot() {
    return serverValue;
  }

  function set(next) {
    if (next === current) return;
    current = next;
    try {
      persist(next);
    } catch {}
    listeners.forEach((l) => l());
  }

  function subscribe(listener) {
    listeners.add(listener);
    const onStorage = (e) => {
      if (e.key === storageKey) {
        current = readInitial();
        listeners.forEach((l) => l());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { getSnapshot, getServerSnapshot, set, subscribe };
}
