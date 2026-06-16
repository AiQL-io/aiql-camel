export function corruptRegistry({ animals, profiles, rng, config }) {
  const e = config.errors;
  const byId = new Map(animals.map((a) => [a.id, a]));
  const profByCamel = new Map(profiles.map((p) => [p.camelId, p]));
  const males = animals.filter((a) => a.sex === "male");

  let counts = {
    wrongSire: 0,
    missingMaternal: 0,
    missingPaternal: 0,
    impossible: 0,
    incomplete: 0,
    duplicate: 0,
  };

  for (const a of animals) {
    if (!a._trueSireId && !a._trueDamId) continue;

    a.registeredParentSireId = a._trueSireId;
    a.registeredParentDamId = a._trueDamId;

    const roll = rng.next();

    if (roll < e.wrongSire) {
      let cand = rng.pick(males);
      let tries = 0;
      while (
        cand &&
        (cand.id === a._trueSireId || cand.id === a.id) &&
        tries++ < 5
      )
        cand = rng.pick(males);
      if (cand) {
        a.registeredParentSireId = cand.id;
        counts.wrongSire++;
      }
    } else if (roll < e.wrongSire + e.impossibleEdge) {
      const younger = animals.find((x) => x.birthYear > a.birthYear + 1);
      if (younger) {
        a.registeredParentSireId = younger.id;
        counts.impossible++;
      }
    } else if (roll < e.wrongSire + e.impossibleEdge + e.missingMaternal) {
      a.registeredParentDamId = null;
      counts.missingMaternal++;
    } else if (
      roll <
      e.wrongSire + e.impossibleEdge + e.missingMaternal + e.missingPaternal
    ) {
      a.registeredParentSireId = null;
      counts.missingPaternal++;
    }
  }

  for (const p of profiles) {
    if (rng.next() < e.incompleteProfile && p.genotypes.length > 6) {
      const drop = rng.int(3, 6);
      const keep = rng.shuffle(p.genotypes).slice(0, p.genotypes.length - drop);
      p.genotypes = keep;
      p.completeness = +(keep.length / (keep.length + drop)).toFixed(2);
      p.qcStatus = "partial";
    }
  }

  const duplicates = [];
  const dupTargets = rng
    .shuffle(animals.slice())
    .slice(0, Math.round(animals.length * e.duplicate));
  let dupCounter = 0;
  for (const orig of dupTargets) {
    const origProf = profByCamel.get(orig.id);
    if (!origProf) continue;
    dupCounter++;
    const id = `c_dup_${dupCounter}`;
    const dnaId = `dna_${id}`;
    const dup = {
      ...orig,
      id,
      registrationId: `${orig.registrationId}-D`,
      dnaProfileId: dnaId,
      _duplicateOf: orig.id,
    };
    const genotypes = origProf.genotypes.map((g) => ({ ...g }));
    animals.push(dup);
    profiles.push({ ...origProf, id: dnaId, camelId: id, genotypes });
    byId.set(id, dup);
    duplicates.push([orig.id, id]);
    counts.duplicate++;
  }

  return { counts, duplicates };
}
