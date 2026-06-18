export function confirmHref(s) {
  const p = new URLSearchParams({ offspring: s.offspringId });
  if (s.target === "dam") {
    p.set("dam", s.candId);
    if (s.otherParentId) {
      p.set("sire", s.otherParentId);
      p.set("mode", "trio");
    } else p.set("mode", "maternity");
  } else {
    p.set("sire", s.candId);
    if (s.otherParentId) {
      p.set("dam", s.otherParentId);
      p.set("mode", "trio");
    } else p.set("mode", "paternity");
  }
  return `/verify?${p.toString()}`;
}
