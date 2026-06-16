export const ROADMAP = [
  {
    slug: "breeding",
    icon: "dna",
    title: "Breeding Decision Support",
    phase: "Phase 2",
    desc: "Matings that minimize inbreeding, maximize diversity.",
    bullets: [
      "Recommend matings that minimize offspring inbreeding",
      "Simulate expected offspring diversity & relatedness",
      "Flag over-related pairings before they happen",
    ],
  },
  {
    slug: "lineage",
    icon: "tree-structure",
    title: "Lineage & Heritage",
    phase: "Phase 2",
    desc: "Reconstruct pedigrees from DNA; preserve bloodlines.",
    bullets: [
      "Reconstruct pedigrees where records are missing",
      "Visualize and preserve historic bloodlines",
      "Trace ancestry from the DNA identity spine",
    ],
  },
  {
    slug: "owner-portal",
    icon: "buildings",
    title: "Owner / Stable Portal",
    phase: "Phase 2",
    desc: "Owners view animals, request tests, get certificates.",
    bullets: [
      "Owners view their registered animals",
      "Request parentage & identity tests",
      "Retrieve verifiable certificates",
    ],
  },
  {
    slug: "health",
    icon: "heartbeat",
    title: "Health & Disease Surveillance",
    phase: "Phase 3",
    desc: "Population health & disease signals.",
    bullets: [
      "Population-scale health monitoring",
      "Disease surveillance signals (incl. MERS-CoV)",
      "Links to the genetic identity spine",
    ],
  },
  {
    slug: "performance",
    icon: "trophy",
    title: "Performance & Racing Analytics",
    phase: "Phase 3",
    desc: "Link genetics to racing outcomes.",
    bullets: [
      "Connect genetics to racing/performance data",
      "Identify performance-linked lines",
      "Benchmark cohorts",
    ],
  },
  {
    slug: "phenotype",
    icon: "paint-brush",
    title: "Phenotype & Trait Intelligence",
    phase: "Phase 3",
    desc: "Coat, conformation & trait associations.",
    bullets: [
      "Associate markers with coat & conformation",
      "Trait intelligence across the population",
      "Foundation for genomic traits",
    ],
  },
  {
    slug: "genomic",
    icon: "dna",
    title: "Genomic Expansion",
    phase: "Phase 3",
    desc: "Extend STR identity to SNP & whole-genome.",
    bullets: [
      "Extend beyond STR to SNP panels",
      "Whole-genome on the same identity spine",
      "No re-identification required",
    ],
  },
];

export const roadmapBySlug = Object.fromEntries(
  ROADMAP.map((m) => [m.slug, m]),
);
