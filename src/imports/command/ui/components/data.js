const VERIF_BY_PERIOD = { 30: "118", 90: "318", 365: "1,190", all: "4,820" };

export const heroBand = (period) => [
  {
    href: "/registry",
    label: "Registered camels",
    value: "40,000",
    delta: "+1,240",
    deltaTone: "up",
    spark: [30, 32, 31, 34, 36, 38, 40],
    sparkColor: "var(--accent)",
  },
  {
    href: "/registry",
    label: "DNA profiles on file",
    value: "39,210",
    delta: "98%",
    deltaTone: "neutral",
    spark: [29, 31, 31, 33, 35, 37, 39],
    sparkColor: "var(--accent)",
  },
  {
    href: "/verify",
    label: `Verifications · ${period === "all" ? "all" : period + "d"}`,
    value: VERIF_BY_PERIOD[period],
    delta: "+46",
    deltaTone: "up",
    spark: [180, 210, 240, 260, 285, 300, 318],
    sparkColor: "var(--accent)",
  },
  {
    href: "/genetics",
    label: "Genetic diversity index",
    value: "72.3",
    unit: "/100",
    delta: "+2.9",
    deltaTone: "up",
    spark: [66, 67, 69, 68, 70, 71, 72],
    sparkColor: "var(--status-success)",
  },
  {
    href: "/integrity",
    label: "Open integrity alerts",
    value: "164",
    delta: "23 critical",
    deltaTone: "down",
    spark: [120, 130, 140, 150, 158, 160, 164],
    sparkColor: "var(--status-danger)",
  },
  {
    href: "/genetics",
    label: "Mean inbreeding",
    value: "0.08",
    delta: "−0.01",
    deltaTone: "up",
    spark: [0.11, 0.1, 0.1, 0.09, 0.09, 0.08, 0.08],
    sparkColor: "var(--status-success)",
  },
];

export const REGIONS = [
  { label: "Riyadh", value: 9800 },
  { label: "Eastern Province", value: 6400 },
  { label: "Qassim", value: 5200 },
  { label: "Makkah", value: 4300 },
  { label: "Hail", value: 3600 },
  { label: "Najran", value: 3100 },
  { label: "Tabuk", value: 2400 },
  { label: "Asir", value: 1900 },
];

export const HET_BINS = [2, 5, 9, 14, 18, 16, 12, 7, 4, 2];
export const INBR_BINS = [22, 17, 13, 10, 7, 5, 3, 2, 1];

export const ALERTS = [
  {
    sev: "critical",
    type: "Impossible parentage",
    subject: "SCC-2021-04412",
    detail: "declared sire excluded · 6 loci",
  },
  {
    sev: "critical",
    type: "Impossible parentage",
    subject: "SCC-2020-01188",
    detail: "declared sire excluded · 5 loci",
  },
  {
    sev: "high",
    type: "Missing maternal",
    subject: "SCC-2022-07731",
    detail: "dam not recorded",
  },
  {
    sev: "high",
    type: "Duplicate suspected",
    subject: "SCC-2019-00942",
    detail: "near-identical profile",
  },
  {
    sev: "medium",
    type: "Incomplete profile",
    subject: "SCC-2023-11020",
    detail: "9 / 14 core loci typed",
  },
];

export const SEV_TONE = {
  critical: "danger",
  high: "warning",
  medium: "default",
  low: "default",
};

export const ACTIVITY = [
  {
    icon: "git-fork",
    text: "Reverse search confirmed sire for SCC-2022-06610",
    time: "12m",
    href: "/verify",
  },
  {
    icon: "certificate",
    text: "Parentage certificate issued · SCC-2021-03390",
    time: "48m",
    href: "/reports",
  },
  {
    icon: "identification-card",
    text: "Record updated · SCC-2020-00781",
    time: "2h",
    href: "/registry",
  },
  {
    icon: "shield-check",
    text: "Alert resolved · duplicate dismissed",
    time: "3h",
    href: "/integrity",
  },
];

export const LIVE_MODULES = [
  {
    n: "01",
    href: "/registry",
    icon: "identification-card",
    title: "DNA Identity Registry",
    desc: "Every camel, anchored to its DNA fingerprint.",
    stat: "40,000 profiles",
    sub: "1,240 added this quarter",
  },
  {
    n: "02",
    href: "/verify",
    icon: "git-fork",
    title: "Verification",
    desc: "Parentage & relationship truth, from biology.",
    stat: "318 cases",
    sub: "12 awaiting review",
    accent: "var(--accent)",
  },
  {
    n: "03",
    href: "/genetics",
    icon: "chart-scatter",
    title: "Population Genetics",
    desc: "Diversity, inbreeding & structure intelligence.",
    stat: "GDI 72.3 / 100",
    sub: "+2.9 vs last quarter",
  },
  {
    n: "04",
    href: "/integrity",
    icon: "shield-check",
    title: "Registry Integrity",
    desc: "Auto-detected errors & reconciliation.",
    stat: "164 open alerts",
    sub: "23 critical",
    accent: "var(--status-danger)",
  },
  {
    n: "05",
    href: "/reports",
    icon: "certificate",
    title: "Reports & Certificates",
    desc: "QR-verifiable certificates & population reports.",
    stat: "1,082 issued",
    sub: "44 this week",
  },
  {
    n: "06",
    href: "/admin",
    icon: "gear-six",
    title: "Admin",
    desc: "Users, marker panel, reference data, audit log.",
    stat: "5 roles",
    sub: "panel v1 · 14 loci",
  },
];
