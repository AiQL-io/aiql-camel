"use client";

import { useMemo } from "react";
import { testSingleParent } from "@/imports/core/engine/parentage.js";

export function useCamelProfile(access, id) {
  return useMemo(() => {
    const animal = access.getAnimal(id);
    if (!animal) return { notFound: true };

    const profile = access.getProfile(id);
    const owner = access.getOwner(animal.ownerId);
    const rel = access.relatives(id);

    const declaredSire = animal.registeredParentSireId
      ? access.getAnimal(animal.registeredParentSireId)
      : null;
    const declaredDam = animal.registeredParentDamId
      ? access.getAnimal(animal.registeredParentDamId)
      : null;

    const sireCheck = declaredSire
      ? testSingleParent(profile, access.getProfile(declaredSire.id))
      : null;
    const damCheck = declaredDam
      ? testSingleParent(profile, access.getProfile(declaredDam.id))
      : null;

    const flags = [];
    if (sireCheck?.verdict === "excluded")
      flags.push({
        sev: "critical",
        type: "Impossible parentage",
        detail: `declared sire excluded · ${sireCheck.mismatchCount} loci`,
      });
    if (!animal.registeredParentDamId)
      flags.push({
        sev: "high",
        type: "Missing maternal",
        detail: "no dam recorded",
      });
    if (!animal.registeredParentSireId)
      flags.push({
        sev: "medium",
        type: "Missing paternal",
        detail: "no sire recorded",
      });
    if (profile && profile.completeness < 1)
      flags.push({
        sev: "medium",
        type: "Incomplete profile",
        detail: `${profile.genotypes.length} loci typed (${Math.round(profile.completeness * 100)}%)`,
      });
    if (animal._duplicateOf)
      flags.push({
        sev: "high",
        type: "Duplicate suspected",
        detail: "near-identical profile on file",
      });

    const bioSire = animal._trueSireId
      ? access.getAnimal(animal._trueSireId)
      : null;
    const bioDam = animal._trueDamId
      ? access.getAnimal(animal._trueDamId)
      : null;

    return {
      notFound: false,
      animal,
      profile,
      owner,
      ...rel,
      declaredSire,
      declaredDam,
      bioSire,
      bioDam,
      sireCheck,
      damCheck,
      flags,
      rankedRelatives: access.rankedRelatives(id),
      pedigree: access.pedigree(id),
    };
  }, [access, id]);
}
