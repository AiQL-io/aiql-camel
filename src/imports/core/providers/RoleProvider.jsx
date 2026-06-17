"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export const ROLES = [
  {
    id: "geneticist",
    name: "Nora Al-Sulaiman",
    role: "Geneticist",
    org: "KFSH",
    avatar: "/assets/avatars/nora.png",
  },
  {
    id: "technician",
    name: "Yousef Al-Harbi",
    role: "Lab Technician",
    org: "KFSH",
  },
  {
    id: "registrar",
    name: "Mishari Al-Otaibi",
    role: "Registrar",
    org: "Saudi Camel Club",
  },
  {
    id: "executive",
    name: "Dr. Faisal Al-Dosari",
    role: "Director",
    org: "Saudi Camel Club",
  },
  {
    id: "admin",
    name: "Platform Admin",
    role: "Platform Admin",
    org: "AiQL",
  },
];

const MATRIX = {
  editRecords: ["geneticist", "technician", "registrar", "admin"],
  runAnalysis: ["geneticist", "technician", "registrar", "admin"],
  runPopgen: ["geneticist", "admin"],
  resolveIntegrity: ["geneticist", "registrar", "admin"],
  issueCertificate: ["geneticist", "technician", "registrar", "admin"],
  manageAdmin: ["admin"],
  exportGenotype: ["geneticist", "admin"],
};

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [roleId, setRoleId] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("manhal.role");
      if (saved && ROLES.some((r) => r.id === saved)) return saved;
    }
    return "geneticist";
  });

  const setRole = useCallback((id) => {
    setRoleId(id);
    try {
      localStorage.setItem("manhal.role", id);
    } catch {}
  }, []);

  const user = ROLES.find((r) => r.id === roleId) || ROLES[0];
  const can = useCallback(
    (capability) => {
      const allowed = MATRIX[capability];
      return allowed ? allowed.includes(roleId) : true;
    },
    [roleId],
  );

  return (
    <RoleContext.Provider value={{ roleId, user, roles: ROLES, setRole, can }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    return {
      roleId: "geneticist",
      user: ROLES[0],
      roles: ROLES,
      setRole: () => {},
      can: () => true,
    };
  }
  return ctx;
}
