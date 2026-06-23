"use client";

import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Card } from "@/imports/core/components/Card.jsx";
import { Button } from "@/imports/core/components/Button.jsx";
import { Select } from "@/imports/core/components/Select.jsx";
import { Icon } from "@/imports/core/components/Icon.jsx";
import { Overline } from "@/imports/core/components/Overline.jsx";
import { DataTable } from "@/imports/core/components/DataTable.jsx";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import {
  useAdmin,
  setUserRole,
  setUserStatus,
  addUser,
  ROLE_DEFS,
  CAPABILITIES,
  CAP_MATRIX,
  permissionsFor,
} from "@/imports/admin/state/adminStore.js";

const ROLE_OPTIONS = ROLE_DEFS.map((r) => ({ value: r.id, label: r.label }));
const CELL = { full: "✓", view: "view", none: "—" };

export function UsersRolesView({ access }) {
  const { users } = useAdmin(access);
  const { can, roleId: activeRoleId, setRole } = useRole();
  const isAdmin = can("manageAdmin");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("technician");

  const create = () => {
    if (!newName.trim()) return;
    addUser({ name: newName.trim(), roleId: newRole });
    setNewName("");
    setAdding(false);
  };

  const columns = useMemo(
    () => [
      {
        id: "user",
        header: "User",
        accessorKey: "name",
        cell: (c) => {
          const u = c.row.original;
          return (
            <span className="user">
              <b>{u.name}</b>
              <em>{u.email}</em>
            </span>
          );
        },
      },
      {
        id: "org",
        header: "Organization",
        accessorKey: "org",
        cell: (c) => <span className="t">{c.getValue()}</span>,
      },
      {
        id: "role",
        header: "Role",
        accessorKey: "roleId",
        enableSorting: false,
        cell: (c) => {
          const u = c.row.original;
          const perms = permissionsFor(u.roleId);
          return (
            <span className="role">
              {isAdmin ? (
                <Select
                  size="sm"
                  value={u.roleId}
                  onChange={(v) => setUserRole(u.id, v)}
                  options={ROLE_OPTIONS}
                />
              ) : (
                ROLE_DEFS.find((r) => r.id === u.roleId)?.label
              )}
              <em className="perms" title={perms.join("\n")}>
                {perms.length} full-access{" "}
                {perms.length === 1 ? "capability" : "capabilities"}
              </em>
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: (c) => (
          <span className={`status ${c.getValue()}`}>{c.getValue()}</span>
        ),
      },
      {
        id: "lastActive",
        header: "Last active",
        accessorKey: "lastActive",
        cell: (c) => (
          <span className="mono">
            {c.getValue() ? new Date(c.getValue()).toLocaleDateString() : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        meta: { align: "end" },
        cell: (c) => {
          const u = c.row.original;
          const isActive = u.roleId === activeRoleId && u.seed;
          return (
            <span className="acts">
              {isActive ? (
                <span className="cur">
                  <Icon name="check-circle" size={13} /> Active persona
                </span>
              ) : (
                <button
                  type="button"
                  className="use"
                  onClick={() => setRole(u.roleId)}
                  title="Switch the demo to this persona"
                >
                  Use persona
                </button>
              )}
              {isAdmin && u.status === "active" && !u.seed && (
                <button
                  type="button"
                  className="susp"
                  onClick={() => setUserStatus(u.id, "suspended")}
                >
                  Suspend
                </button>
              )}
              {isAdmin && u.status === "suspended" && (
                <button
                  type="button"
                  className="use"
                  onClick={() => setUserStatus(u.id, "active")}
                >
                  Reactivate
                </button>
              )}
            </span>
          );
        },
      },
    ],
    [isAdmin, activeRoleId, setRole],
  );

  return (
    <>
      <Section>
        <Head>
          <Overline>Users ({users.length})</Overline>
          {isAdmin && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setAdding((o) => !o)}
              leadingIcon={<Icon name="user-plus" size={14} />}
            >
              Invite user
            </Button>
          )}
        </Head>

        {adding && (
          <AddRow>
            <input
              placeholder="Full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Select
              size="sm"
              value={newRole}
              onChange={setNewRole}
              options={ROLE_OPTIONS}
            />
            <Button size="sm" variant="primary" onClick={create}>
              Send invite
            </Button>
          </AddRow>
        )}

        <CellStyles>
          <DataTable columns={columns} data={users} emptyMessage="No users." />
        </CellStyles>
      </Section>

      <Card style={{ marginTop: 16 }}>
        <Overline>Permissions matrix (v1, enforced in UI)</Overline>
        <p className="sub">
          Capabilities per role. <b>✓</b> = full, <b>view</b> = read-only
          results, <b>—</b> = no access.
        </p>
        <Matrix style={{ "--cols": ROLE_DEFS.length }}>
          <div className="mhead">
            <span className="cap">Capability</span>
            {ROLE_DEFS.map((r) => (
              <span key={r.id} className="rh">
                {r.label}
              </span>
            ))}
          </div>
          {CAPABILITIES.map((c) => (
            <div className="mrow" key={c.key}>
              <span className="cap">{c.label}</span>
              {ROLE_DEFS.map((r) => {
                const v = CAP_MATRIX[c.key][r.id];
                return (
                  <span key={r.id} className={`cell ${v}`}>
                    {CELL[v]}
                  </span>
                );
              })}
            </div>
          ))}
        </Matrix>
      </Card>
    </>
  );
}

const Section = styled.div`
  .sub {
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    margin: 4px 0 12px;
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const AddRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--accent);
  background: var(--accent-soft);
  border-radius: var(--radius-lg);

  input {
    flex: 1;
    padding: 7px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    color: var(--fg);
    font-size: var(--text-sm);
  }
`;

const CellStyles = styled.div`
  .user {
    display: flex;
    flex-direction: column;
  }
  .user b {
    font-size: var(--text-sm);
  }
  .user em {
    font-style: normal;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .t {
    color: var(--fg-secondary);
    font-size: var(--text-xs);
  }
  .role {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }
  .role .perms {
    font-style: normal;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    cursor: help;
  }
  .status {
    font-size: var(--text-xs);
    text-transform: capitalize;
  }
  .status.active {
    color: var(--status-success);
  }
  .status.invited {
    color: var(--status-warning, #b8860b);
  }
  .status.suspended {
    color: var(--danger);
  }
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--fg-subtle);
  }
  .acts {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
  .acts .cur {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs);
    color: var(--accent);
  }
  .acts button {
    border: 1px solid var(--border);
    background: var(--surface);
    border-radius: var(--radius-pill);
    padding: 3px 10px;
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .acts .use {
    color: var(--accent);
  }
  .acts .susp {
    color: var(--danger);
  }
`;

const Matrix = styled.div`
  margin-top: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;

  .mhead,
  .mrow {
    display: grid;
    grid-template-columns: 2fr repeat(var(--cols), 1fr);
    align-items: center;
  }
  .mhead {
    background: var(--surface-2);
    border-bottom: 1px solid var(--border);
  }
  .mhead .rh {
    text-align: center;
    font-size: var(--text-xs);
    color: var(--fg-subtle);
    padding: 8px 6px;
  }
  .mhead .cap,
  .mrow .cap {
    padding: 8px 12px;
    font-size: var(--text-sm);
    color: var(--fg-secondary);
  }
  .mrow {
    border-bottom: 1px solid var(--separator);
  }
  .mrow:last-child {
    border-bottom: none;
  }
  .cell {
    text-align: center;
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    padding: 8px 6px;
  }
  .cell.full {
    color: var(--status-success);
    font-weight: var(--weight-medium);
  }
  .cell.view {
    color: var(--fg-subtle);
  }
  .cell.none {
    color: var(--fg-muted);
  }
`;
