export const STATUS_TONE = {
  draft: "default",
  review: "warning",
  approved: "success",
  rejected: "danger",
};

export const VERDICT_TONE = {
  consistent: "success",
  excluded: "danger",
  inconclusive: "warning",
};

export function exportPacket(c) {
  const lines = [
    `MANHAL — Verification Case Packet`,
    `Case: ${c.number}`,
    `Type: ${c.type}`,
    `Verdict: ${c.verdict}`,
    `Status: ${c.status}`,
    ``,
    `Subjects:`,
    `  Offspring: ${c.subjects.offspring?.name || ""} (${c.subjects.offspring?.reg || ""})`,
    c.subjects.sire
      ? `  Sire: ${c.subjects.sire.name || ""} (${c.subjects.sire.reg || ""})`
      : "",
    c.subjects.dam
      ? `  Dam: ${c.subjects.dam.name || ""} (${c.subjects.dam.reg || ""})`
      : "",
    ``,
    `Statistics:`,
    `  Loci compared: ${c.stats.lociCompared ?? "—"}`,
    `  Mismatches: ${c.stats.mismatchCount ?? "—"}`,
    `  CPE: ${c.stats.cpe ?? "—"}`,
    `  Tolerance: ${c.stats.tolerance ?? "—"}`,
    ``,
    `Provenance:`,
    `  Panel: Manhal Camel STR Panel v1`,
    `  Snapshotted at test time: ${c.createdAt}`,
    c.certificate
      ? `\nCertificate: ${c.certificate.code}${c.certificate.revoked ? " (REVOKED)" : ""}`
      : "",
    ``,
    `Audit trail:`,
    ...c.timeline.map((t) => `  ${t.at} — ${t.action} (${t.by})`),
  ];
  const blob = new Blob([lines.filter(Boolean).join("\n")], {
    type: "text/plain",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${c.number}-packet.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
