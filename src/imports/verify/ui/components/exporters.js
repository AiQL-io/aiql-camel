export function provenanceLines({
  title = "Verification export",
  subjects,
  panel,
  tolerance,
  estimator,
} = {}) {
  const lines = [`# Manhal — ${title}`];
  if (subjects) lines.push(`# Subjects: ${subjects}`);
  if (panel)
    lines.push(
      `# Panel: ${panel.name || panel.id} v${panel.version ?? 1} (${panel.id})`,
    );
  if (tolerance != null) lines.push(`# Tolerance: ${tolerance}`);
  if (estimator) lines.push(`# Estimator: ${estimator}`);
  lines.push(`# Generated: ${new Date().toISOString()}`);
  return lines;
}

export function download(text, filename, mime = "text/csv") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export function exportCsv({ filename, columns, rows, provenance }) {
  const head = columns.map((c) => c.label).join(",");
  const body = rows
    .map((r) => columns.map((c) => esc(c.get(r))).join(","))
    .join("\n");
  const text = [...provenanceLines(provenance), head, body].join("\n");
  download(text, filename, "text/csv");
}
