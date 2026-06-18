"use client";

import { useState, useMemo, useCallback } from "react";
import {
  REGISTRY_COLUMNS,
  DEFAULT_COLUMN_KEYS,
} from "@/imports/registry/ui/components/RegistryTable.jsx";

const EMPTY_FILTERS = {
  breed: "",
  region: "",
  sex: "",
  status: "",
  owner: "",
  dna: "",
  parentage: "",
  alerts: "",
};

const EMPTY_RANGES = {
  ageMin: "",
  ageMax: "",
  complMin: "",
  complMax: "",
  fMin: "",
  fMax: "",
  bornFrom: "",
  bornTo: "",
};

export const PAGE_SIZES = [25, 50, 100, "All"];

export const QUICK_CHIPS = [
  {
    id: "unverified",
    label: "Unverified parentage",
    patch: { parentage: "unknown" },
  },
  {
    id: "critical",
    label: "Has critical alert",
    patch: { alerts: "critical" },
  },
  {
    id: "profiled-noparent",
    label: "Profiled, no parentage",
    patch: { dna: "yes", parentage: "unknown" },
  },
  {
    id: "conflict",
    label: "Registry/biology conflict",
    patch: { parentage: "conflict" },
  },
];

export function useRegistry(access) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(() => {
    if (typeof window !== "undefined") {
      const region = new URLSearchParams(window.location.search).get("region");
      if (region) return { ...EMPTY_FILTERS, region };
    }
    return EMPTY_FILTERS;
  });
  const [ranges, setRanges] = useState(EMPTY_RANGES);
  const [sorts, setSorts] = useState([{ key: "registrationId", dir: "asc" }]);
  const [density, setDensity] = useState("comfortable");
  const [view, setView] = useState("table");
  const [selected, setSelected] = useState(() => new Set());
  const [savedViews, setSavedViews] = useState([]);
  const [activeChip, setActiveChip] = useState("");
  const [visibleCols, setVisibleCols] = useState(DEFAULT_COLUMN_KEYS);
  const [colOrder, setColOrder] = useState(DEFAULT_COLUMN_KEYS);
  const [pinned, setPinned] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const toggleCol = useCallback((key) => {
    setVisibleCols((cols) =>
      cols.includes(key)
        ? cols.length === 1
          ? cols
          : cols.filter((k) => k !== key)
        : [...cols, key],
    );
  }, []);

  const moveCol = useCallback((key, dir) => {
    setColOrder((order) => {
      const i = order.indexOf(key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= order.length) return order;
      const next = order.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  const togglePin = useCallback((key) => {
    setPinned((p) =>
      p.includes(key) ? p.filter((k) => k !== key) : [...p, key],
    );
  }, []);

  const orderedVisible = useMemo(() => {
    const inOrder = colOrder.filter((k) => visibleCols.includes(k));
    const pin = inOrder.filter((k) => pinned.includes(k));
    const rest = inOrder.filter((k) => !pinned.includes(k));
    return [...pin, ...rest];
  }, [colOrder, visibleCols, pinned]);

  const { rows: allRows, total } = useMemo(
    () =>
      access.search({
        query,
        ...filters,
        ranges,
        sorts,
        pageSize: Infinity,
      }),
    [access, query, filters, ranges, sorts],
  );

  const finitePage = pageSize !== "All";
  const size = finitePage ? pageSize : total;
  const pageCount = Math.max(1, Math.ceil(total / (size || 1)));
  const safePage = Math.min(page, pageCount - 1);
  const rows = finitePage
    ? allRows.slice(safePage * size, safePage * size + size)
    : allRows;

  const updateQuery = useCallback((v) => {
    setQuery(v);
    setPage(0);
  }, []);

  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setActiveChip("");
    setPage(0);
  }, []);

  const setRange = useCallback((key, value) => {
    setRanges((r) => ({ ...r, [key]: value }));
    setPage(0);
  }, []);

  const clear = useCallback(() => {
    setQuery("");
    setFilters(EMPTY_FILTERS);
    setRanges(EMPTY_RANGES);
    setActiveChip("");
    setPage(0);
  }, []);

  const updatePageSize = useCallback((s) => {
    setPageSize(s);
    setPage(0);
  }, []);

  const applyChip = useCallback(
    (chip) => {
      setPage(0);
      if (activeChip === chip.id) {
        setFilters(EMPTY_FILTERS);
        setActiveChip("");
        return;
      }
      setFilters({ ...EMPTY_FILTERS, ...chip.patch });
      setActiveChip(chip.id);
    },
    [activeChip],
  );

  const sortMostInbred = useCallback(() => {
    setSorts([{ key: "inbreedingF", dir: "desc" }]);
    setActiveChip("mostinbred");
  }, []);

  const toggleSort = useCallback((key, additive = false) => {
    setSorts((list) => {
      const idx = list.findIndex((s) => s.key === key);
      if (!additive) {
        if (idx === 0 && list.length === 1)
          return [{ key, dir: list[0].dir === "asc" ? "desc" : "asc" }];
        return [{ key, dir: "asc" }];
      }
      if (idx === -1) return [...list, { key, dir: "asc" }];
      const cur = list[idx];
      if (cur.dir === "asc") {
        const next = list.slice();
        next[idx] = { key, dir: "desc" };
        return next;
      }
      return list.filter((s) => s.key !== key);
    });
  }, []);

  const toggleRow = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === allRows.length
        ? new Set()
        : new Set(allRows.map((r) => r.id)),
    );
  }, [allRows]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const saveView = useCallback(
    (name) =>
      setSavedViews((v) => [
        ...v,
        {
          id: `v_${v.length + 1}`,
          name,
          query,
          filters: { ...filters },
          ranges: { ...ranges },
          sorts: sorts.slice(),
        },
      ]),
    [query, filters, ranges, sorts],
  );

  const applyView = useCallback((v) => {
    setQuery(v.query);
    setFilters(v.filters);
    setRanges(v.ranges || EMPTY_RANGES);
    setSorts(v.sorts || [{ key: "registrationId", dir: "asc" }]);
    setActiveChip("");
  }, []);

  const hasFilters = Boolean(
    query ||
    Object.values(filters).some(Boolean) ||
    Object.values(ranges).some((v) => v !== ""),
  );

  return {
    query,
    setQuery: updateQuery,
    filters,
    setFilter,
    ranges,
    setRange,
    clear,
    hasFilters,
    sorts,
    toggleSort,
    sortMostInbred,
    rows,
    allRows,
    total,
    grandTotal: access.total,
    facets: access.facets,
    density,
    setDensity,
    view,
    setView,
    selected,
    toggleRow,
    toggleAll,
    clearSelection,
    savedViews,
    saveView,
    applyView,
    quickChips: QUICK_CHIPS,
    activeChip,
    applyChip,
    regionCounts: access.regionCounts(),
    allColumns: REGISTRY_COLUMNS,
    columnMap: Object.fromEntries(REGISTRY_COLUMNS.map((c) => [c.key, c])),
    visibleCols,
    colOrder,
    orderedVisible,
    pinned,
    toggleCol,
    moveCol,
    togglePin,
    page: safePage,
    setPage,
    pageSize,
    setPageSize: updatePageSize,
    pageSizes: PAGE_SIZES,
    pageCount,
  };
}
