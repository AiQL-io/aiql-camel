"use client";

import React from "react";
import styled from "styled-components";
import { useRole } from "@/imports/core/providers/RoleProvider.jsx";
import { useAlerts } from "@/imports/integrity/state/alertStore.js";
import { AlertEmpty } from "./AlertEmpty.jsx";
import { AlertHead } from "./AlertHead.jsx";
import { AlertEvidence } from "./AlertEvidence.jsx";
import { AlertAnimals } from "./AlertAnimals.jsx";
import { AlertRecommendations } from "./AlertRecommendations.jsx";
import { AlertResolution } from "./AlertResolution.jsx";
import { AlertTimeline } from "./AlertTimeline.jsx";

export function AlertDetailView({ access, alertId }) {
  const { getAlert, assignAlert, setAlertStatus, addAlertNote } =
    useAlerts(access);
  const { user, can } = useRole();

  const alert = getAlert(alertId);
  const mayResolve = can("resolveIntegrity");

  if (!alert) return <AlertEmpty />;

  const subject = alert.subjectId ? access.getAnimal(alert.subjectId) : null;
  const related = (alert.relatedIds || [])
    .map((id) => access.getAnimal(id))
    .filter(Boolean);

  return (
    <>
      <AlertHead alert={alert} />

      <Grid>
        <div className="main">
          <AlertEvidence alert={alert} />
          <AlertAnimals alert={alert} subject={subject} related={related} />
          <AlertRecommendations alert={alert} subject={subject} />
        </div>

        <div className="side">
          <AlertResolution
            alert={alert}
            user={user}
            mayResolve={mayResolve}
            assignAlert={assignAlert}
            setAlertStatus={setAlertStatus}
          />
          <AlertTimeline
            alert={alert}
            user={user}
            addAlertNote={addAlertNote}
          />
        </div>
      </Grid>
    </>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 16px;
  margin-top: 20px;

  > * {
    min-width: 0;
  }

  .main,
  .side {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;
