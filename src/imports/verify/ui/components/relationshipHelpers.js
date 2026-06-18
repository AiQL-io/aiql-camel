export function declaredRelationship(access, fId, oId) {
  const f = access.getAnimal(fId);
  const o = access.getAnimal(oId);
  if (!f || !o) return "—";
  if (f.registeredParentSireId === o.id || f.registeredParentDamId === o.id)
    return "Declared parent";
  if (o.registeredParentSireId === f.id || o.registeredParentDamId === f.id)
    return "Declared offspring";
  const shareSire =
    f.registeredParentSireId &&
    f.registeredParentSireId === o.registeredParentSireId;
  const shareDam =
    f.registeredParentDamId &&
    f.registeredParentDamId === o.registeredParentDamId;
  if (shareSire && shareDam) return "Declared full sib";
  if (shareSire || shareDam) return "Declared half sib";
  return "Not recorded";
}

export function agrees(inferred, declared) {
  const po = inferred === "Parent–offspring";
  const fs = inferred === "Full siblings";
  const hs = inferred === "Half siblings";
  if (po)
    return declared === "Declared parent" || declared === "Declared offspring";
  if (fs) return declared === "Declared full sib";
  if (hs) return declared === "Declared half sib";
  return true;
}
