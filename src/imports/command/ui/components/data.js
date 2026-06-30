export const SEV_TONE = {
  critical: "danger",
  high: "warning",
  medium: "default",
  low: "default",
};

function buildActivity(access) {
  const animals = access.animals;
  const items = [];
  const conflict = animals.find((a) => a.parentageStatus === "conflict");
  if (conflict)
    items.push({
      icon: "flag",
      text: `Impossible parentage flagged · ${conflict.registrationId}`,
      sub: `${conflict.breed} · ${conflict.region}`,
      href: "/integrity",
    });
  const dup = animals.find((a) => a._duplicateOf);
  if (dup)
    items.push({
      icon: "copy",
      text: `Duplicate suspected · ${dup.registrationId}`,
      sub: dup.ownerName,
      href: "/integrity",
    });
  const recent = animals
    .filter((a) => a.hasDNA)
    .slice(-3)
    .reverse();
  recent.forEach((a) =>
    items.push({
      icon: "dna",
      text: `DNA profile on file · ${a.registrationId}`,
      sub: `${a.breed} · ${a.ownerName}`,
      href: `/registry/${a.id}`,
    }),
  );
  return items.slice(0, 5);
}

function spark(dir, n = 28) {
  const hash = (x) => (((Math.sin(x) * 43758.5453) % 1) + 1) % 1;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = dir > 0 ? 0.5 + 0.5 * t : 1 - 0.45 * t;
    const noise =
      (hash((i + 1) * 12.9898) - 0.5) * 0.2 +
      (hash((i + 1) * 78.233) - 0.5) * 0.12;
    pts.push(+(base + noise).toFixed(3));
  }
  return pts;
}

export function buildCommandData(access, period) {
  const s = access.summary();
  const d = access.diversity;
  const periodLabel = period === "all" ? "all" : `${period}d`;

  const hero = [
    {
      href: "/registry",
      label: "Registered camels",
      value: s.total.toLocaleString(),
      spark: spark(1),
      sparkColor: "var(--accent)",
    },
    {
      href: "/registry",
      label: "DNA profiles on file",
      value: s.profiled.toLocaleString(),
      unit: `${Math.round((s.profiled / Math.max(1, s.total)) * 100)}%`,
      spark: spark(1),
      sparkColor: "var(--accent)",
    },
    {
      href: "/verify",
      label: `Profiles analyzed · ${periodLabel}`,
      value: access.analyzedCount(period).toLocaleString(),
      spark: spark(1),
      sparkColor: "var(--accent)",
    },
    {
      href: "/genetics",
      label: "Genetic diversity index",
      value: d.gdi,
      unit: "/100",
      spark: spark(1),
      sparkColor: "var(--status-success)",
    },
    {
      href: "/integrity",
      label: "Open integrity alerts",
      value: s.alerts.toLocaleString(),
      spark: spark(1),
      sparkColor: "var(--status-danger)",
    },
    {
      href: "/genetics",
      label: "Mean inbreeding",
      value: s.meanF.toFixed(2),
      spark: spark(-1),
      sparkColor: "var(--status-success)",
    },
  ];

  return {
    hero,
    regions: access
      .regionCounts()
      .slice(0, 8)
      .map((r) => ({ label: r.region, value: r.count })),
    hetBins: d.hetBins,
    inbrBins: d.inbreedingBins,
    richnessGauge: Math.round(Math.min(d.meanRichness / 20, 1) * 100),
    meanRichness: d.meanRichness,
    alerts: access.topAlerts(5),
    clusters: access.clusters(),
    activity: buildActivity(access),
  };
}

export const LIVE_MODULES = [
  {
    n: "01",
    href: "/registry",
    icon: "identification-card",
    title: "DNA Identity Registry",
    desc: "Every camel, anchored to its DNA fingerprint.",
    stat: "Browse & search",
    sub: "national register",
    accent: "var(--aiql-mark-aqua)",
  },
  {
    n: "02",
    href: "/verify",
    icon: "git-fork",
    title: "Verification",
    desc: "Parentage & relationship truth, from biology.",
    stat: "Workbench & reverse search",
    sub: "exclusion-based",
    accent: "var(--accent)",
  },
  {
    n: "03",
    href: "/genetics",
    icon: "chart-scatter",
    title: "Population Genetics",
    desc: "Diversity, inbreeding & structure intelligence.",
    stat: "Diversity analytics",
    sub: "national scale",
    accent: "var(--aiql-mark-violet)",
  },
  {
    n: "04",
    href: "/integrity",
    icon: "shield-check",
    title: "Registry Integrity",
    desc: "Auto-detected errors & reconciliation.",
    stat: "Alert queue",
    sub: "evidence-backed",
    accent: "var(--status-danger)",
  },
  {
    n: "05",
    href: "/reports",
    icon: "certificate",
    title: "Reports & Certificates",
    desc: "QR-verifiable certificates & population reports.",
    stat: "Generate & verify",
    sub: "bilingual",
    accent: "var(--status-success)",
  },
  {
    n: "06",
    href: "/admin",
    icon: "gear-six",
    title: "Admin",
    desc: "Users, marker panel, reference data, audit log.",
    stat: "5 roles",
    sub: "panel v1",
    accent: "var(--fg-tertiary)",
  },
];
