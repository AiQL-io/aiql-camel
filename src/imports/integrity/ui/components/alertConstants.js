export const SEV_TONE = {
  critical: "danger",
  high: "warning",
  medium: "default",
  low: "default",
};

export const STATUS_TONE = {
  open: "danger",
  in_review: "warning",
  resolved: "success",
  dismissed: "default",
};

export const SEVS = ["critical", "high", "medium", "low"];

export const RECOMMENDED = {
  impossible_parentage: [
    "Open Reconciliation to compare declared vs. biological parentage.",
    "Run a reverse parentage search to identify the true parent.",
    "Propose a registry correction once a candidate is confirmed.",
  ],
  registry_biology_conflict: [
    "Open Reconciliation to weigh the declared parent against the better-fitting candidate.",
    "Confirm the candidate with a trio verification before any change.",
  ],
  missing_maternal: [
    "Request a maternal sample or link an existing dam record.",
    "Run a reverse search (dam) to propose a candidate.",
  ],
  missing_paternal: [
    "Request a paternal sample or link an existing sire record.",
    "Run a reverse search (sire) to propose a candidate.",
  ],
  duplicate_suspected: [
    "Compare the two registrations side by side.",
    "Merge or retire the duplicate after owner confirmation.",
  ],
  incomplete_profile: [
    "Re-run the STR panel to fill the missing loci.",
    "Flag the sample for re-collection if amplification failed.",
  ],
  hwe_anomaly: [
    "Review locus performance across the panel.",
    "Consider down-weighting or retiring the locus in the panel config.",
  ],
  relatedness_conflict: [
    "Open the Relationship Explorer to inspect the contradiction.",
  ],
};

export const EV_LABEL = {
  rule: "Rule",
  role: "Parent role",
  mismatchLoci: "Opposition loci",
  lociCompared: "Loci compared",
  declared: "Declared parent",
  other: "Matching registration",
  locus: "Locus",
  pic: "PIC",
  na: "Alleles (Nₐ)",
  lociTyped: "Loci typed",
  completeness: "Completeness",
};

export function evValue(key, v) {
  if (Array.isArray(v)) return v.join(", ");
  if (key === "completeness" && typeof v === "number")
    return `${Math.round(v * 100)}%`;
  return String(v);
}
