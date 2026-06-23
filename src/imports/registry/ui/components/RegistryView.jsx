"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { BackToHome } from "@/imports/core/components/BackToHome.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Chip } from "@/imports/core/components/Chip.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Card } from "@/imports/core/components/Card.jsx";
import { RegionMap } from "@/imports/core/components/RegionMap.jsx";
import { useI18n } from "@/imports/core/providers/I18nProvider.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { useRegistry } from "@/imports/registry/hooks/useRegistry.js";
import { RegistryFilters } from "./RegistryFilters.jsx";
import { RegistryTable } from "./RegistryTable.jsx";
import { CamelDrawer } from "./CamelDrawer.jsx";

const EXPORT_COLS = [
  ["registrationId", "Reg ID"],
  ["name", "Name"],
  ["nameArabic", "Name (AR)"],
  ["breed", "Breed"],
  ["region", "Region"],
  ["ownerName", "Owner"],
  ["sex", "Sex"],
  ["birthYear", "Born"],
  ["hasDNA", "DNA"],
  ["parentageStatus", "Parentage"],
  ["completenessScore", "Completeness"],
  ["alertCount", "Alerts"],
  ["status", "Status"],
];

function cellValue(r, k) {
  let v = r[k];
  if (k === "hasDNA") v = r[k] ? "yes" : "no";
  if (k === "completenessScore") v = Math.round(r[k] * 100) + "%";
  return String(v ?? "");
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCsv(rows) {
  const head = EXPORT_COLS.map((c) => c[1]).join(",");
  const body = rows
    .map((r) =>
      EXPORT_COLS.map(([k]) => `"${cellValue(r, k).replace(/"/g, '""')}"`).join(
        ",",
      ),
    )
    .join("\n");
  download(
    new Blob([head + "\n" + body], { type: "text/csv" }),
    "manhal-registry.csv",
  );
}

function exportXlsx(rows) {
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const head = EXPORT_COLS.map((c) => `<th>${esc(c[1])}</th>`).join("");
  const body = rows
    .map(
      (r) =>
        `<tr>${EXPORT_COLS.map(([k]) => `<td>${esc(cellValue(r, k))}</td>`).join("")}</tr>`,
    )
    .join("");
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
  download(
    new Blob([html], { type: "application/vnd.ms-excel" }),
    "manhal-registry.xls",
  );
}

export function RegistryView({ access }) {
  const { t } = useI18n();
  const { can } = useRole();
  const router = useRouter();
  const reg = useRegistry(access);
  const [drawer, setDrawer] = useState(null);
  const [colMenu, setColMenu] = useState(false);
  const [rangeMenu, setRangeMenu] = useState(false);

  const selCount = reg.selected.size;

  return (
    <>
      <BackToHome />
      <Head>
        <div>
          <Overline>{t("registry.overline")}</Overline>
          <h1>{t("nav.registry")}</h1>
        </div>
        <div className="actions">
          <span className="count">
            {reg.total.toLocaleString()} of {reg.grandTotal.toLocaleString()}{" "}
            animals
          </span>
          <Button
            as={Link}
            href="/registry/match"
            variant="secondary"
            leadingIcon={<Icon name="fingerprint" size={16} />}
          >
            Identity match
          </Button>
          {can("editRecords") && (
            <Button
              as={Link}
              href="/registry/new"
              variant="primary"
              leadingIcon={<Icon name="plus" size={16} />}
            >
              Add camel
            </Button>
          )}
        </div>
      </Head>

      <RegistryFilters
        query={reg.query}
        setQuery={reg.setQuery}
        filters={reg.filters}
        setFilter={reg.setFilter}
        facets={reg.facets}
        hasFilters={reg.hasFilters}
        clear={reg.clear}
      />

      <Toolbar>
        <div className="chips">
          {reg.quickChips.map((c) => (
            <button
              key={c.id}
              type="button"
              className={reg.activeChip === c.id ? "chip on" : "chip"}
              onClick={() => reg.applyChip(c)}
            >
              {c.label}
            </button>
          ))}
          <button
            type="button"
            className={reg.activeChip === "mostinbred" ? "chip on" : "chip"}
            onClick={reg.sortMostInbred}
          >
            Most inbred
          </button>
          {reg.savedViews.map((v) => (
            <button
              key={v.id}
              type="button"
              className="chip saved"
              onClick={() => reg.applyView(v)}
            >
              <Icon name="bookmark-simple" size={12} /> {v.name}
            </button>
          ))}
        </div>
        <div className="tools">
          <SegBtns>
            <button
              className={reg.view === "table" ? "on" : ""}
              onClick={() => reg.setView("table")}
              type="button"
              aria-label="Table view"
            >
              <Icon name="table" size={15} />
            </button>
            <button
              className={reg.view === "map" ? "on" : ""}
              onClick={() => reg.setView("map")}
              type="button"
              aria-label="Map view"
            >
              <Icon name="map-trifold" size={15} />
            </button>
          </SegBtns>
          <SegBtns>
            <button
              className={reg.density === "comfortable" ? "on" : ""}
              onClick={() => reg.setDensity("comfortable")}
              type="button"
              aria-label="Comfortable density"
            >
              <Icon name="rows" size={15} />
            </button>
            <button
              className={reg.density === "compact" ? "on" : ""}
              onClick={() => reg.setDensity("compact")}
              type="button"
              aria-label="Compact density"
            >
              <Icon name="list-dashes" size={15} />
            </button>
          </SegBtns>
          <ColMenu>
            <button
              type="button"
              className="tbtn"
              onClick={() => setRangeMenu((o) => !o)}
            >
              <Icon name="sliders-horizontal" size={14} /> Ranges
            </button>
            {rangeMenu && (
              <>
                <div className="scrim" onClick={() => setRangeMenu(false)} />
                <div className="menu wide">
                  {[
                    ["Age (yrs)", "ageMin", "ageMax"],
                    ["Completeness (%)", "complMin", "complMax"],
                    ["Inbreeding F", "fMin", "fMax"],
                    ["Born (year)", "bornFrom", "bornTo"],
                  ].map(([label, lo, hi]) => (
                    <div className="range-row" key={lo}>
                      <span>{label}</span>
                      <input
                        type="number"
                        placeholder="min"
                        value={reg.ranges[lo]}
                        onChange={(e) => reg.setRange(lo, e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="max"
                        value={reg.ranges[hi]}
                        onChange={(e) => reg.setRange(hi, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </ColMenu>
          <ColMenu>
            <button
              type="button"
              className="tbtn"
              onClick={() => setColMenu((o) => !o)}
            >
              <Icon name="columns" size={14} /> Columns
            </button>
            {colMenu && (
              <>
                <div className="scrim" onClick={() => setColMenu(false)} />
                <div className="menu wide">
                  {reg.colOrder.map((key, i) => {
                    const c = reg.columnMap[key];
                    return (
                      <div className="col-row" key={key}>
                        <label>
                          <input
                            type="checkbox"
                            checked={reg.visibleCols.includes(key)}
                            onChange={() => reg.toggleCol(key)}
                          />
                          {c.label}
                        </label>
                        <div className="col-acts">
                          <button
                            type="button"
                            title={reg.pinned.includes(key) ? "Unpin" : "Pin"}
                            className={reg.pinned.includes(key) ? "on" : ""}
                            onClick={() => reg.togglePin(key)}
                          >
                            <Icon name="push-pin" size={13} />
                          </button>
                          <button
                            type="button"
                            title="Move up"
                            disabled={i === 0}
                            onClick={() => reg.moveCol(key, -1)}
                          >
                            <Icon name="caret-up" size={12} />
                          </button>
                          <button
                            type="button"
                            title="Move down"
                            disabled={i === reg.colOrder.length - 1}
                            onClick={() => reg.moveCol(key, 1)}
                          >
                            <Icon name="caret-down" size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </ColMenu>
          <button
            type="button"
            className="tbtn"
            onClick={() => {
              const name = prompt("Name this view");
              if (name) reg.saveView(name);
            }}
          >
            <Icon name="bookmark-simple" size={14} /> Save view
          </button>
          <button
            type="button"
            className="tbtn"
            onClick={() => exportCsv(reg.allRows)}
          >
            <Icon name="download-simple" size={14} /> CSV
          </button>
          <button
            type="button"
            className="tbtn"
            onClick={() => exportXlsx(reg.allRows)}
          >
            <Icon name="file-xls" size={14} /> XLSX
          </button>
        </div>
      </Toolbar>

      {selCount > 0 && (
        <BulkBar>
          <span className="n">{selCount} selected</span>
          <div className="acts">
            <button
              type="button"
              onClick={() =>
                exportCsv(reg.allRows.filter((r) => reg.selected.has(r.id)))
              }
            >
              <Icon name="download-simple" size={14} /> CSV
            </button>
            <button
              type="button"
              onClick={() =>
                exportXlsx(reg.allRows.filter((r) => reg.selected.has(r.id)))
              }
            >
              <Icon name="file-xls" size={14} /> XLSX
            </button>
            <button
              type="button"
              onClick={() =>
                router.push(`/verify/batch?ids=${[...reg.selected].join(",")}`)
              }
            >
              <Icon name="git-fork" size={14} /> Batch verify
            </button>
            <button type="button" onClick={() => router.push("/reports")}>
              <Icon name="certificate" size={14} /> Certificates
            </button>
            <button type="button" onClick={() => router.push("/integrity")}>
              <Icon name="flag" size={14} /> Assign to review
            </button>
          </div>
          <button type="button" className="clear" onClick={reg.clearSelection}>
            Clear
          </button>
        </BulkBar>
      )}

      {reg.view === "table" ? (
        <>
          <RegistryTable
            rows={reg.rows}
            sorts={reg.sorts}
            toggleSort={reg.toggleSort}
            density={reg.density}
            selected={reg.selected}
            toggleRow={reg.toggleRow}
            toggleAll={reg.toggleAll}
            onOpen={setDrawer}
            columns={reg.orderedVisible}
            pinned={reg.pinned}
          />
          <Pager>
            <span className="info">
              {reg.total === 0
                ? "No animals"
                : `${reg.page * (reg.pageSize === "All" ? reg.total : reg.pageSize) + 1}–${Math.min(
                    (reg.page + 1) *
                      (reg.pageSize === "All" ? reg.total : reg.pageSize),
                    reg.total,
                  )} of ${reg.total.toLocaleString()}`}
            </span>
            <div className="ctrls">
              <span className="lbl">Rows</span>
              {reg.pageSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={reg.pageSize === s ? "sz on" : "sz"}
                  onClick={() => reg.setPageSize(s)}
                >
                  {s}
                </button>
              ))}
              <button
                type="button"
                className="nav"
                disabled={reg.page === 0}
                onClick={() => reg.setPage(reg.page - 1)}
              >
                <Icon name="caret-left" size={14} />
              </button>
              <span className="pg">
                {reg.page + 1} / {reg.pageCount}
              </span>
              <button
                type="button"
                className="nav"
                disabled={reg.page >= reg.pageCount - 1}
                onClick={() => reg.setPage(reg.page + 1)}
              >
                <Icon name="caret-right" size={14} />
              </button>
            </div>
          </Pager>
        </>
      ) : (
        <Card style={{ marginTop: 12 }}>
          <Overline style={{ marginBottom: 12 }}>
            Geographic distribution · {reg.total.toLocaleString()} animals
          </Overline>
          <div style={{ maxWidth: 620, margin: "0 auto" }}>
            <RegionMap
              data={reg.regionCounts}
              selected={reg.filters.region}
              onSelect={(r) => reg.setFilter("region", r)}
            />
          </div>
        </Card>
      )}

      <CamelDrawer
        animal={drawer}
        access={access}
        onClose={() => setDrawer(null)}
      />
    </>
  );
}

const Head = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  h1 {
    font-size: var(--text-2xl);
    line-height: 40px;
    font-weight: var(--weight-medium);
    letter-spacing: -0.02em;
    margin-top: 8px;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .count {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--fg-subtle);
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;

  .chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 28px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .chip:hover {
    background: var(--surface-2);
  }
  .chip.on {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
  .chip.saved {
    color: var(--fg-subtle);
  }
  .tools {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .tbtn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .tbtn:hover {
    background: var(--surface-2);
    color: var(--fg);
  }
`;

const SegBtns = styled.div`
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  overflow: hidden;

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 30px;
    border: none;
    background: transparent;
    color: var(--fg-muted);
    cursor: pointer;
  }
  button.on {
    background: var(--accent-soft);
    color: var(--accent);
  }
`;

const BulkBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  padding: 10px 16px;
  background: var(--accent-soft);
  border: 1px solid var(--accent);
  border-radius: var(--radius-lg);

  .n {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--accent);
  }
  .acts {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .acts button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface);
    color: var(--fg);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .acts button:hover {
    background: var(--surface-2);
  }
  .clear {
    margin-inline-start: auto;
    border: none;
    background: transparent;
    color: var(--fg-subtle);
    font-size: var(--text-xs);
    cursor: pointer;
  }
`;

const ColMenu = styled.div`
  position: relative;

  .scrim {
    position: fixed;
    inset: 0;
    z-index: 40;
  }
  .menu {
    position: absolute;
    z-index: 50;
    top: calc(100% + 6px);
    inset-inline-end: 0;
    min-width: 180px;
    padding: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-popover);
  }
  .menu.wide {
    min-width: 260px;
  }
  .menu label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    color: var(--fg);
    cursor: pointer;
  }
  .menu label:hover {
    background: var(--surface-2);
  }
  .col-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .col-row label {
    flex: 1;
  }
  .col-acts {
    display: inline-flex;
    gap: 2px;
  }
  .col-acts button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--fg-subtle);
    cursor: pointer;
  }
  .col-acts button.on {
    color: var(--accent);
    border-color: var(--accent);
  }
  .col-acts button:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .range-row {
    display: grid;
    grid-template-columns: 1fr 64px 64px;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
  }
  .range-row span {
    font-size: var(--text-xs);
    color: var(--fg-secondary);
  }
  .range-row input {
    height: 30px;
    padding: 0 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--field-bg);
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    width: 100%;
  }
`;

const Pager = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;

  .info {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .ctrls {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .ctrls .lbl {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin-inline-end: 2px;
  }
  .sz {
    height: 28px;
    min-width: 34px;
    padding: 0 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .sz.on {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
  .nav {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 28px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-secondary);
    cursor: pointer;
  }
  .nav:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .pg {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    min-width: 56px;
    text-align: center;
  }
`;
