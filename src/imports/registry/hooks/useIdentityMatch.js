"use client";

import { useState, useMemo } from "react";

function genotypeOf(access, animal) {
  const prof = access.getProfile(animal.id);
  return prof.genotypes.map((g) => ({
    locus: g.locus,
    alleleA: g.alleleA,
    alleleB: g.alleleB,
  }));
}

function parseGenotypeText(text, template) {
  const byLocus = new Map(template.map((g) => [g.locus.toUpperCase(), g]));
  const out = template.map((g) => ({ ...g }));
  const lines = text.split(/\r?\n/);
  let matched = 0;
  for (const line of lines) {
    const parts = line
      .trim()
      .split(/[\s,;\t]+/)
      .filter(Boolean);
    if (parts.length < 3) continue;
    const locus = parts[0].toUpperCase();
    if (!byLocus.has(locus)) continue;
    const a = Number(parts[1]);
    const b = Number(parts[2]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    const target = out.find((g) => g.locus.toUpperCase() === locus);
    target.alleleA = a;
    target.alleleB = b;
    matched++;
  }
  return { genotype: out, matched };
}

export function useIdentityMatch(access) {
  const sample = access.animals[0];
  const template = genotypeOf(access, sample);
  const [query, setQuery] = useState(() => template);
  const [sourceLabel, setSourceLabel] = useState(
    `${sample.name} · ${sample.registrationId}`,
  );
  const [searched, setSearched] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [parseNote, setParseNote] = useState("");

  const results = useMemo(
    () => (searched ? access.matchGenotype(query) : []),
    [access, query, searched],
  );
  const exactMatches = results.filter((r) => r.score === 1);

  const setAllele = (locus, key, value) => {
    setQuery((q) =>
      q.map((g) =>
        g.locus === locus ? { ...g, [key]: Number(value) || 0 } : g,
      ),
    );
    setSearched(false);
    setParseNote("");
  };
  const loadFromAnimal = (id) => {
    const a = access.getAnimal(id);
    if (!a) return;
    setQuery(genotypeOf(access, a));
    setSourceLabel(`${a.name} · ${a.registrationId}`);
    setSearched(true);
    setSelectedId(null);
    setParseNote("");
  };
  const loadFromText = (text) => {
    const { genotype, matched } = parseGenotypeText(text, template);
    setQuery(genotype);
    setSourceLabel("Pasted / uploaded sample");
    setSearched(true);
    setSelectedId(null);
    setParseNote(
      matched
        ? `Parsed ${matched} of ${template.length} loci.`
        : "No loci recognized — use rows of: LOCUS alleleA alleleB",
    );
  };
  const run = () => setSearched(true);

  const selected = selectedId ? access.getAnimal(selectedId) : null;
  const selectedGeno = selectedId
    ? access.getProfile(selectedId)?.genotypes
    : null;

  return {
    query,
    setAllele,
    loadFromAnimal,
    loadFromText,
    run,
    searched,
    sourceLabel,
    parseNote,
    sampleAnimals: access.animals.slice(0, 12),
    results,
    exactMatches,
    selectedId,
    setSelectedId,
    selected,
    selectedGeno,
  };
}
