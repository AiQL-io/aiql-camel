"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  useCallback,
} from "react";
import en from "@/imports/core/i18n/en.js";
import ar from "@/imports/core/i18n/ar.js";
import { createPersistentStore } from "@/imports/core/lib/persistentStore.js";

const DICTS = { en, ar };
const DIR = { en: "ltr", ar: "rtl" };
const STORAGE_KEY = "manhal.locale";

const I18nContext = createContext({
  locale: "en",
  dir: "ltr",
  t: (k) => k,
  setLocale: () => {},
  toggleLocale: () => {},
});

export function I18nProvider({ children, defaultLocale = "en" }) {
  const store = useMemo(
    () =>
      createPersistentStore({
        storageKey: STORAGE_KEY,
        serverValue: defaultLocale,
        readInitial: () => {
          const attr = document.documentElement.getAttribute("lang");
          if (attr === "en" || attr === "ar") return attr;
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === "en" || stored === "ar") return stored;
          } catch {}
          return defaultLocale;
        },
        persist: (v) => localStorage.setItem(STORAGE_KEY, v),
      }),
    [defaultLocale],
  );

  const locale = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", DIR[locale]);
  }, [locale]);

  const setLocale = useCallback((l) => store.set(l), [store]);
  const toggleLocale = useCallback(
    () => store.set(locale === "ar" ? "en" : "ar"),
    [store, locale],
  );

  const t = useCallback(
    (key, vars) => {
      let str = DICTS[locale]?.[key] ?? DICTS.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, dir: DIR[locale], t, setLocale, toggleLocale }),
    [locale, t, setLocale, toggleLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
