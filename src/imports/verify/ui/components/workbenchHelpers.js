export function snapshot(access, animal) {
  if (!animal) return null;
  const prof = access.getProfile(animal.id);
  return {
    id: animal.id,
    name: animal.name,
    reg: animal.registrationId,
    sex: animal.sex,
    genotypes: prof ? prof.genotypes.map((g) => ({ ...g })) : [],
  };
}
