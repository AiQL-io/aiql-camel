"use client";

import { useState, useCallback } from "react";

function initialParam(name) {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name) || "";
}

export function useReverseSearch(access) {
  const [offspringId, setOffspringId] = useState(() =>
    initialParam("offspring"),
  );
  const [target, setTarget] = useState("sire");
  const [minParentAge, setMinParentAge] = useState(3);
  const [region, setRegion] = useState("");
  const [owner, setOwner] = useState("");
  const [tolerance, setTolerance] = useState(1);
  const [otherParentId, setOtherParentId] = useState("");
  const [result, setResult] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const offspring = offspringId ? access.getAnimal(offspringId) : null;
  const canSearch = Boolean(offspringId && access.getProfile(offspringId));

  const run = useCallback(() => {
    if (!offspringId) return;
    const res = access.reverseSearch(offspringId, {
      target,
      tolerance,
      minParentAge,
      region,
      owner,
      otherParentId,
    });
    setResult(res);
    setSelectedId(res.survivors?.[0]?.animal.id || null);
  }, [
    access,
    offspringId,
    target,
    tolerance,
    minParentAge,
    region,
    owner,
    otherParentId,
  ]);

  const reset = (setter) => (v) => {
    setter(v);
    setResult(null);
  };

  const selected = selectedId ? access.getAnimal(selectedId) : null;
  const offProf = offspringId ? access.getProfile(offspringId) : null;
  const selProf = selectedId ? access.getProfile(selectedId) : null;

  return {
    offspringId,
    setOffspringId: reset(setOffspringId),
    offspring,
    target,
    setTarget: reset(setTarget),
    minParentAge,
    setMinParentAge: reset(setMinParentAge),
    region,
    setRegion: reset(setRegion),
    owner,
    setOwner: reset(setOwner),
    tolerance,
    setTolerance: reset(setTolerance),
    otherParentId,
    setOtherParentId: reset(setOtherParentId),
    canSearch,
    run,
    result,
    selectedId,
    setSelectedId,
    selected,
    offProf,
    selProf,
    facets: access.facets,
  };
}
