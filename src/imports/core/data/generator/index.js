import { makeRng, sampleAllele } from "@/imports/core/lib/rng.js";
import { buildPanel } from "@/imports/core/data/panel/markerPanel.js";
import {
  BREEDS,
  REGIONS,
  MALE_NAMES,
  FEMALE_NAMES,
  MALE_NAMES_AR,
  FEMALE_NAMES_AR,
  buildBreedFrequencies,
} from "./reference.js";
import { corruptRegistry } from "./registryLayer.js";

export const DEFAULT_CONFIG = {
  seed: 42,
  size: 5000,
  foundersFraction: 0.1,
  mutationRate: 0.003,
  baseYear: 2026,
  ownersPer: 22,
  inbredOwnerCount: 2,

  errors: {
    missingMaternal: 0.15,
    missingPaternal: 0.05,
    wrongSire: 0.04,
    duplicate: 0.01,
    incompleteProfile: 0.05,
    impossibleEdge: 0.01,
  },
};

const BREED_WEIGHTS = BREEDS.map((b) => (b.group === "indigenous" ? 4 : 1));

function mutate(allele, rng, rate, range) {
  if (rng.next() >= rate) return allele;
  const shift = rng.bool() ? 2 : -2;
  let v = allele + shift;
  if (v < range[0]) v = range[0];
  if (v > range[1]) v = range[1];
  return v;
}

export function generateDataset(userConfig = {}) {
  const config = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    errors: { ...DEFAULT_CONFIG.errors, ...(userConfig.errors || {}) },
  };
  const rng = makeRng(config.seed);
  const panel = buildPanel(rng, {});
  const breedFreq = buildBreedFrequencies(panel, rng);

  const ownerCount = Math.max(8, Math.round(config.size / config.ownersPer));
  const owners = [];
  for (let i = 0; i < ownerCount; i++) {
    const breed = BREEDS[rng.weightedIndex(BREED_WEIGHTS)];
    owners.push({
      id: `o_${i + 1}`,
      name: `Stable ${i + 1}`,
      nameArabic: `حظيرة ${i + 1}`,
      type: rng.pick(["individual", "stable", "farm"]),
      region: rng.pick(REGIONS),
      primaryBreedId: breed.id,
      animalCount: 0,
    });
  }
  const inbredOwnerIds = new Set(
    rng.shuffle(owners.map((o) => o.id)).slice(0, config.inbredOwnerCount),
  );

  const animals = [];
  const profiles = [];
  const byBreedSex = {};
  BREEDS.forEach((b) => (byBreedSex[b.id] = { male: [], female: [] }));
  const breedOwners = {};
  BREEDS.forEach(
    (b) =>
      (breedOwners[b.id] = owners.filter((o) => o.primaryBreedId === b.id)),
  );
  const genoByCamel = new Map();
  const ownerAnimals = new Map();
  owners.forEach((o) => ownerAnimals.set(o.id, { male: [], female: [] }));

  let counter = 0;
  const newId = () => `c_${String(++counter).padStart(6, "0")}`;

  function makeGenotypeFromFreqs(freqPerLocus) {
    return panel.loci.map((l) => {
      const entries = freqPerLocus[l.locusName];
      return {
        locus: l.locusName,
        alleleA: sampleAllele(entries, rng.next()),
        alleleB: sampleAllele(entries, rng.next()),
      };
    });
  }

  function makeGenotypeFromParents(sireGeno, damGeno) {
    const sMap = {};
    sireGeno.forEach((g) => (sMap[g.locus] = g));
    const dMap = {};
    damGeno.forEach((g) => (dMap[g.locus] = g));
    return panel.loci.map((l) => {
      const s = sMap[l.locusName];
      const d = dMap[l.locusName];
      let a = rng.bool() ? s.alleleA : s.alleleB;
      let b = rng.bool() ? d.alleleA : d.alleleB;
      a = mutate(a, rng, config.mutationRate, l.alleleRange);
      b = mutate(b, rng, config.mutationRate, l.alleleRange);
      return { locus: l.locusName, alleleA: a, alleleB: b };
    });
  }

  function addAnimal({
    breed,
    owner,
    sex,
    birthYear,
    genotype,
    trueSireId,
    trueDamId,
  }) {
    const id = newId();
    const dnaId = `dna_${id}`;
    const isMale = sex === "male";
    const namePool = isMale ? MALE_NAMES : FEMALE_NAMES;
    const namePoolAr = isMale ? MALE_NAMES_AR : FEMALE_NAMES_AR;
    const ni = rng.int(0, namePool.length - 1);
    const animal = {
      id,
      registrationId: `SCC-${birthYear}-${String(counter).padStart(5, "0")}`,
      name: `${namePool[ni]} ${counter}`,
      nameArabic: namePoolAr[ni],
      sex,
      dateOfBirth: `${birthYear}-${String(rng.int(1, 12)).padStart(2, "0")}-${String(rng.int(1, 28)).padStart(2, "0")}`,
      birthYear,
      breed: breed.name,
      breedId: breed.id,
      lineageType: breed.group,
      coatColor: breed.coat,
      ownerId: owner.id,
      region: owner.region,
      status: rng.next() < 0.95 ? "active" : rng.pick(["deceased", "exported"]),
      registeredParentSireId: null,
      registeredParentDamId: null,
      dnaProfileId: dnaId,
      _trueSireId: trueSireId,
      _trueDamId: trueDamId,
      createdAt: `${birthYear}-01-01`,
    };
    profiles.push({
      id: dnaId,
      camelId: id,
      panelId: panel.id,
      labReportRef: `LAB-${counter}`,
      analysisDate: `${Math.min(birthYear + 1, config.baseYear)}-06-01`,
      method: "fragment-analysis",
      qcStatus: "pass",
      genotypes: genotype,
      completeness: 1,
      qualityScore: 0.95 + rng.next() * 0.05,
    });
    animals.push(animal);
    owner.animalCount++;
    byBreedSex[breed.id][sex].push(animal);
    genoByCamel.set(id, genotype);
    const oa = ownerAnimals.get(owner.id);
    if (oa) oa[sex].push(animal);
    return animal;
  }

  const foundersCount = Math.max(
    BREEDS.length * 4,
    Math.round(config.size * config.foundersFraction),
  );
  for (let i = 0; i < foundersCount; i++) {
    const breed = BREEDS[rng.weightedIndex(BREED_WEIGHTS)];
    const bo = breedOwners[breed.id];
    const owner = bo.length ? rng.pick(bo) : rng.pick(owners);
    const sex = rng.next() < 0.45 ? "male" : "female";
    const birthYear = config.baseYear - rng.int(18, 26);
    const genotype = makeGenotypeFromFreqs(breedFreq[breed.id]);
    addAnimal({
      breed,
      owner,
      sex,
      birthYear,
      genotype,
      trueSireId: null,
      trueDamId: null,
    });
  }

  let guard = 0;
  while (animals.length < config.size && guard < config.size * 5) {
    guard++;
    const breed = BREEDS[rng.weightedIndex(BREED_WEIGHTS)];
    const males = byBreedSex[breed.id].male;
    const females = byBreedSex[breed.id].female;
    if (males.length < 1 || females.length < 1) continue;

    const bo = breedOwners[breed.id];
    const owner = bo.length ? rng.pick(bo) : rng.pick(owners);
    const inbred = inbredOwnerIds.has(owner.id);

    let sire, dam;
    if (inbred) {
      const oa = ownerAnimals.get(owner.id);
      sire = oa.male.length ? rng.pick(oa.male) : rng.pick(males);
      dam = oa.female.length ? rng.pick(oa.female) : rng.pick(females);
    } else {
      sire = rng.pick(males);
      dam = rng.pick(females);
    }
    if (!sire || !dam || sire.id === dam.id) continue;

    const parentMaxYear = Math.max(sire.birthYear, dam.birthYear);
    const birthYear = Math.min(
      parentMaxYear + rng.int(3, 8),
      config.baseYear - 1,
    );
    if (birthYear <= parentMaxYear) continue;

    const genotype = makeGenotypeFromParents(
      genoByCamel.get(sire.id),
      genoByCamel.get(dam.id),
    );
    const sex = rng.next() < 0.45 ? "male" : "female";
    addAnimal({
      breed,
      owner,
      sex,
      birthYear,
      genotype,
      trueSireId: sire.id,
      trueDamId: dam.id,
    });
  }

  const { duplicates } = corruptRegistry({
    animals,
    profiles,
    panel,
    rng,
    config,
  });

  return {
    panel,
    animals,
    profiles,
    owners,
    config,
    meta: {
      size: animals.length,
      founders: foundersCount,
      inbredOwnerIds: [...inbredOwnerIds],
      duplicates,
      generatedAt: new Date().toISOString(),
    },
  };
}
