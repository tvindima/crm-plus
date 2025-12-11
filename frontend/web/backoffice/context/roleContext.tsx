'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type Role = "agent" | "leader" | "admin";

type RoleContextValue = {
  role: Role;
  setRole: (r: Role) => void;
  permissions: {
    canEditAllProperties: boolean;
    canEditTeamOnly: boolean;
    canViewReports: boolean;
    canManageAutomation: boolean;
  };
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("agent");

  const permissions = useMemo(() => {
    if (role === "admin") {
      return {
        canEditAllProperties: true,
        canEditTeamOnly: true,
        canViewReports: true,
        canManageAutomation: true,
      };
    }
    if (role === "leader") {
      return {
        canEditAllProperties: false,
        canEditTeamOnly: true,
        canViewReports: true,
        canManageAutomation: true,
      };
    }
    // agent
    return {
      canEditAllProperties: false,
      canEditTeamOnly: true,
      canViewReports: false,
      canManageAutomation: false,
    };
  }, [role]);

  return <RoleContext.Provider value={{ role, setRole, permissions }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole deve ser usado dentro de RoleProvider");
  return ctx;
}
