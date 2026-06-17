"use client";

import { useState, useMemo } from "react";
import { testSingleParent } from "@/imports/core/engine/parentage.js";

function blankForm(access) {
  return {
    name: "",
    nameArabic: "",
    sex: "female",
    breed: access.facets.breeds[0] || "",
    region: access.facets.regions[0] || "",
    ownerId: access.owners[0]?.id || "",
    dateOfBirth: "",
    registeredParentSireId: "",
    registeredParentDamId: "",
  };
}

function genotypeOf(access, id) {
  const prof = access.getProfile(id);
  return prof ? prof.genotypes.map((g) => ({ ...g })) : [];
}

export function useCamelForm(access, id) {
  const editing = Boolean(id);
  const animal = id ? access.getAnimal(id) : null;

  const [form, setForm] = useState(() => {
    if (animal) {
      return {
        name: animal.name,
        nameArabic: animal.nameArabic,
        sex: animal.sex,
        breed: animal.breed,
        region: animal.region,
        ownerId: animal.ownerId,
        dateOfBirth: animal.dateOfBirth,
        registeredParentSireId: animal.registeredParentSireId || "",
        registeredParentDamId: animal.registeredParentDamId || "",
      };
    }
    return blankForm(access);
  });

  const [genotype, setGenotype] = useState(() =>
    animal
      ? genotypeOf(access, animal.id)
      : genotypeOf(access, access.animals[0].id),
  );
  const [saved, setSaved] = useState(false);
  const [dnaAssociated, setDnaAssociated] = useState(() =>
    animal ? Boolean(animal.dnaProfileId) : false,
  );

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };
  const setAllele = (locus, key, value) => {
    setGenotype((g) =>
      g.map((x) =>
        x.locus === locus ? { ...x, [key]: Number(value) || 0 } : x,
      ),
    );
    setSaved(false);
  };

  const sireCheck = useMemo(() => {
    if (!form.registeredParentSireId) return null;
    const p = access.getProfile(form.registeredParentSireId);
    return p ? testSingleParent({ genotypes: genotype }, p) : null;
  }, [access, form.registeredParentSireId, genotype]);

  const damCheck = useMemo(() => {
    if (!form.registeredParentDamId) return null;
    const p = access.getProfile(form.registeredParentDamId);
    return p ? testSingleParent({ genotypes: genotype }, p) : null;
  }, [access, form.registeredParentDamId, genotype]);

  const males = useMemo(
    () => access.animals.filter((a) => a.sex === "male"),
    [access],
  );
  const females = useMemo(
    () => access.animals.filter((a) => a.sex === "female"),
    [access],
  );

  const toggleDna = (v) => {
    setDnaAssociated(v);
    setSaved(false);
  };

  const save = () => {
    access.addAudit({
      actorId: "demo-user",
      action: editing
        ? `Edited record · ${form.name}`
        : `Registered camel · ${form.name}`,
      entityType: "camel",
      entityId: id || "new",
    });
    setSaved(true);
  };

  return {
    editing,
    animal,
    form,
    setField,
    genotype,
    setAllele,
    dnaAssociated,
    toggleDna,
    sireCheck,
    damCheck,
    males,
    females,
    facets: access.facets,
    owners: access.owners,
    saved,
    save,
  };
}
