"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  useCallback,
} from "react";
import { createPersistentStore } from "@/imports/core/lib/persistentStore.js";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

const STORAGE_KEY = "manhal.theme";

export function ThemeProvider({ children, defaultTheme = "light" }) {
  const store = useMemo(
    () =>
      createPersistentStore({
        storageKey: STORAGE_KEY,
        serverValue: defaultTheme,
        readInitial: () => {
          const attr = document.documentElement.getAttribute("data-theme");
          if (attr === "light" || attr === "dark") return attr;
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === "light" || stored === "dark") return stored;
          } catch {}
          return window.matchMedia?.("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        },
        persist: (v) => localStorage.setItem(STORAGE_KEY, v),
      }),
    [defaultTheme],
  );

  const theme = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((t) => store.set(t), [store]);
  const toggleTheme = useCallback(
    () => store.set(theme === "dark" ? "light" : "dark"),
    [store, theme],
  );

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
