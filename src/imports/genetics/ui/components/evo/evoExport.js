export function downloadStructurePng(result, selectedOrf, pngRef) {
  const uri = pngRef && pngRef.current ? pngRef.current() : null;
  if (!uri) {
    if (typeof window !== "undefined")
      window.alert("Select a protein (ORF) in the sequence first.");
    return;
  }
  const org = ((result && result.organism) || "generated").replace(
    /[^a-z0-9]+/gi,
    "_",
  );
  const a = document.createElement("a");
  a.href = uri;
  a.download = `evo2_${org}_ORF${selectedOrf ?? 0}_structure.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
