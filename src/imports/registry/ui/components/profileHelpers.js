export const VERDICT_TONE = {
  consistent: "success",
  inconclusive: "warning",
  excluded: "danger",
};

export const STATUS_TONE = {
  active: "success",
  deceased: "default",
  exported: "warning",
};

export const COAT = {
  Black: "#1d1d1f",
  White: "#f2f2f2",
  Light: "#d9c7a3",
  Blond: "#d9b96a",
  Mixed: "#9a8c7a",
  Cream: "#ece3cf",
  Brown: "#7a4b27",
  Red: "#9c4528",
};

export function hijriYear(gYear) {
  return Math.floor((gYear - 622) * (33 / 32)) + 1;
}

export function ageYears(birthYear) {
  return Math.max(0, new Date().getFullYear() - birthYear);
}

export function genotypeCsv(animal, profile) {
  const head = "locus,alleleA,alleleB";
  const body = profile.genotypes
    .map((g) => `${g.locus},${g.alleleA},${g.alleleB}`)
    .join("\n");
  const blob = new Blob([`# ${animal.registrationId}\n${head}\n${body}`], {
    type: "text/csv",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${animal.registrationId}-genotype.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
