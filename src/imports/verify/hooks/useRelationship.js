"use client";

import { useState, useMemo } from "react";

function initialParam(name) {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name) || "";
}

const ESTIMATORS = [
  { value: "qg", label: "Queller & Goodnight (1989)" },
  { value: "lr", label: "Lynch & Ritland (1999)" },
];

export function useRelationship(access) {
  const [aId, setAId] = useState(
    () => initialParam("a") || initialParam("focal"),
  );
  const [bId, setBId] = useState(() => initialParam("b"));
  const [estimator, setEstimator] = useState("qg");

  const a = aId ? access.getAnimal(aId) : null;
  const b = bId ? access.getAnimal(bId) : null;

  const pair = useMemo(
    () => (aId && bId ? access.relatednessTo(aId, bId, { estimator }) : null),
    [access, aId, bId, estimator],
  );

  const family = useMemo(
    () => (aId ? access.rankedRelatives(aId) : []),
    [access, aId],
  );

  return {
    aId,
    setAId,
    bId,
    setBId,
    a,
    b,
    estimator,
    setEstimator,
    estimators: ESTIMATORS,
    pair,
    aProf: aId ? access.getProfile(aId) : null,
    bProf: bId ? access.getProfile(bId) : null,
    family,
  };
}
