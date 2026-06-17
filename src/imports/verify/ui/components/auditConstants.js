export const SEG = [
  { key: "consistent", label: "Consistent", color: "var(--status-success)" },
  {
    key: "inconclusive",
    label: "Inconclusive",
    color: "var(--status-warning)",
  },
  { key: "excluded", label: "Excluded", color: "var(--danger)" },
  { key: "not-testable", label: "Not testable", color: "var(--fg-muted)" },
];

export const VERDICT_TONE = {
  consistent: "success",
  inconclusive: "warning",
  excluded: "danger",
  "not-testable": "default",
};

import { provenanceLines, download } from "./exporters.js";

export function exportCsv(rows, provenance = {}) {
  const head =
    "offspring,declared_parent,role,verdict,mismatches,region,breed,owner";
  const body = rows
    .map((r) =>
      [
        r.offspring,
        r.parent,
        r.role,
        r.verdict,
        r.mismatchCount ?? "",
        r.region,
        r.breed,
        r.ownerName,
      ]
        .map((v) => `"${String(v ?? "")}"`)
        .join(","),
    )
    .join("\n");
  const prov = provenanceLines({ title: "Registry audit", ...provenance });
  download([...prov, head, body].join("\n"), "manhal-registry-audit.csv");
}

export function exportIntegrityReport(summary, total, provenance = {}) {
  const pct = (n) => `${((n / (total || 1)) * 100).toFixed(2)}%`;
  const lines = [
    ...provenanceLines({ title: "Registry Integrity Report", ...provenance }),
    "",
    `Declared links audited: ${total}`,
    `Consistent: ${summary.consistent} (${pct(summary.consistent)})`,
    `Inconclusive: ${summary.inconclusive} (${pct(summary.inconclusive)})`,
    `Excluded: ${summary.excluded} (${pct(summary.excluded)})`,
    `Not testable: ${summary["not-testable"] || 0}`,
    "",
    `Headline: ${summary.excluded} of ${total} declared links are genetically excluded.`,
  ];
  download(lines.join("\n"), "manhal-integrity-report.txt", "text/plain");
}
