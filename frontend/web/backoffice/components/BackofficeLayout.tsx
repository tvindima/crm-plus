import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { RoleProvider } from "../context/roleContext";

export function BackofficeLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <RoleProvider>
      <div className="flex min-h-screen bg-[#0B0B0D] text-white">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 space-y-4 bg-[#0B0B0D] p-4">
            <h1 className="text-2xl font-semibold">{title}</h1>
            {children}
          </main>
        </div>
      </div>
    </RoleProvider>
  );
}
