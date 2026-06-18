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

function serializeSvg(svgEl) {
  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (!clone.getAttribute("width") || !clone.getAttribute("height")) {
    const r = svgEl.getBoundingClientRect();
    clone.setAttribute("width", Math.max(1, Math.round(r.width)));
    clone.setAttribute("height", Math.max(1, Math.round(r.height)));
  }
  const cs = getComputedStyle(document.documentElement);
  const vars = [
    "--accent",
    "--fg",
    "--fg-secondary",
    "--fg-subtle",
    "--surface",
    "--surface-2",
    "--border",
    "--separator",
    "--danger",
    "--status-success",
    "--status-info",
  ];
  const decl = vars
    .map((v) => `${v}:${cs.getPropertyValue(v).trim()}`)
    .filter((d) => d.split(":")[1])
    .join(";");
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `svg{${decl}}`;
  clone.insertBefore(style, clone.firstChild);
  return new XMLSerializer().serializeToString(clone);
}

export function downloadSvg(svgEl, filename) {
  if (!svgEl) return;
  download(serializeSvg(svgEl), filename, "image/svg+xml");
}

export function downloadSvgAsPng(svgEl, filename, scale = 2) {
  if (!svgEl) return;
  const str = serializeSvg(svgEl);
  const r = svgEl.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width));
  const h = Math.max(1, Math.round(r.height));
  const img = new Image();
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(str);
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    const bg = getComputedStyle(document.documentElement)
      .getPropertyValue("--surface")
      .trim();
    ctx.fillStyle = bg || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  img.src = svgUrl;
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
