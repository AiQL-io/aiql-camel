"use client";

import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { reconcileRole } from "./reconcileHelpers.js";
import { ReconcileEmpty } from "./ReconcileEmpty.jsx";
import { ReconcileSubjectHead } from "./ReconcileSubjectHead.jsx";
import { ReconcileRoleCard } from "./ReconcileRoleCard.jsx";
import { ReconcileSessionLog } from "./ReconcileSessionLog.jsx";

export function ReconciliationView({ access, subjectId }) {
  const { user, can } = useRole();
  const [log, setLog] = useState([]);
  const mayResolve = can("resolveIntegrity");

  const subject = access.getAnimal(subjectId);
  const sire = useMemo(
    () => (subject ? reconcileRole(access, subjectId, "sire") : null),
    [access, subjectId, subject],
  );
  const dam = useMemo(
    () => (subject ? reconcileRole(access, subjectId, "dam") : null),
    [access, subjectId, subject],
  );

  if (!subject) return <ReconcileEmpty />;

  const act = (kind, role, detail) => {
    const entry = {
      kind,
      role,
      detail,
      by: user.name,
      at: new Date().toISOString(),
    };
    access.addAudit({
      entityId: subjectId,
      action: kind,
      actor: user.name,
      detail: `${role}: ${detail}`,
    });
    setLog((l) => [entry, ...l]);
  };

  return (
    <>
      <ReconcileSubjectHead subject={subject} />

      {[sire, dam].map((m) => (
        <ReconcileRoleCard
          key={m.role}
          m={m}
          subjectId={subjectId}
          mayResolve={mayResolve}
          onAct={act}
        />
      ))}

      {!mayResolve && (
        <Gate>
          Reconciliation actions are restricted to Geneticist / Registrar /
          Admin. You can review the contradiction read-only.
        </Gate>
      )}

      <ReconcileSessionLog log={log} />
    </>
  );
}

const Gate = styled.p`
  margin-top: 12px;
  font-size: var(--text-xs);
  color: var(--fg-subtle);
`;
