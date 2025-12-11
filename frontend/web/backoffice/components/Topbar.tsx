'use client';

import { useRole } from "../context/roleContext";

const roleLabels = {
  agent: "Agente",
  leader: "Líder",
  admin: "Admin",
};

export function Topbar() {
  const { role, setRole } = useRole();
  return (
    <header className="flex items-center justify-end border-b border-[#1F1F22] bg-[#0F0F10] px-6 py-3">
      <div>
        <p className="text-sm text-[#C5C5C5]">Role: {roleLabels[role]}</p>
      </div>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as any)}
        className="ml-3 rounded border border-[#2A2A2E] bg-[#0B0B0D] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
      >
        <option value="agent">Agente</option>
        <option value="leader">Líder</option>
        <option value="admin">Admin</option>
      </select>
    </header>
  );
}
