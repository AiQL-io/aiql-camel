"use client";

import React, { useState } from "react";
import styled from "styled-components";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Icon } from "@/imports/core/components/Icon.jsx";

export function DataTable({
  columns,
  data,
  globalFilter = "",
  pageSize = 0,
  onRowClick,
  getRowClassName,
  emptyMessage = "No rows.",
  maxHeight,
}) {
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(pageSize
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          initialState: { pagination: { pageSize } },
        }
      : {}),
  });

  const rows = table.getRowModel().rows;

  return (
    <Wrap>
      <Scroll style={maxHeight ? { maxHeight } : undefined}>
        <table>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const sortable = h.column.getCanSort();
                  const dir = h.column.getIsSorted();
                  return (
                    <th
                      key={h.id}
                      style={{
                        width: h.getSize() ? h.getSize() : undefined,
                        textAlign: h.column.columnDef.meta?.align || "start",
                        cursor: sortable ? "pointer" : "default",
                      }}
                      onClick={
                        sortable
                          ? h.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <span className="th-inner">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {sortable && (
                          <span className={`sort ${dir || ""}`}>
                            <Icon
                              name={
                                dir === "asc"
                                  ? "caret-up"
                                  : dir === "desc"
                                    ? "caret-down"
                                    : "caret-up-down"
                              }
                              size={11}
                            />
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`${onRowClick ? "clickable" : ""}${
                  getRowClassName ? ` ${getRowClassName(row.original)}` : ""
                }`.trim()}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      textAlign: cell.column.columnDef.meta?.align || "start",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="empty" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Scroll>

      {pageSize > 0 && rows.length > 0 && (
        <Pager>
          <span className="info">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()} · {table.getFilteredRowModel().rows.length}{" "}
            rows
          </span>
          <div className="btns">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <Icon name="caret-left" size={13} /> Prev
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next <Icon name="caret-right" size={13} />
            </button>
          </div>
        </Pager>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  overflow: hidden;
`;

const Scroll = styled.div`
  overflow: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--text-sm);
  }
  thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--bg-muted, var(--surface-2));
    border-bottom: 1px solid var(--border);
    padding: 11px 14px;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-subtle);
    font-weight: var(--weight-regular);
    white-space: nowrap;
    user-select: none;
  }
  .th-inner {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .sort {
    color: var(--fg-disabled);
    display: inline-flex;
  }
  .sort.asc,
  .sort.desc {
    color: var(--accent);
  }
  tbody td {
    padding: 11px 14px;
    border-bottom: 1px solid var(--separator);
    color: var(--fg);
    vertical-align: middle;
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody tr.clickable {
    cursor: pointer;
  }
  tbody tr:hover td {
    background: var(--surface-2);
    transition: background 120ms ease;
  }
  .empty {
    text-align: center;
    padding: 28px;
    color: var(--fg-subtle);
  }
`;

const Pager = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-top: 1px solid var(--border);
  background: var(--surface);

  .info {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .btns {
    display: flex;
    gap: 8px;
  }
  .btns button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface);
    color: var(--fg-secondary);
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .btns button:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
  }
  .btns button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;
