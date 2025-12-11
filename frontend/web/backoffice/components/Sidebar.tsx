import Link from "next/link";
import { useRole } from "../context/roleContext";

const links = [
  { href: "/backoffice/dashboard", label: "Dashboard", roles: ["agent", "leader", "admin"] },
  { href: "/backoffice/imoveis", label: "Imóveis", roles: ["agent", "leader", "admin"] },
  { href: "/backoffice/leads", label: "Leads", roles: ["agent", "leader", "admin"] },
  { href: "/backoffice/agentes", label: "Agentes", roles: ["leader", "admin"] },
  { href: "/backoffice/equipas", label: "Equipas", roles: ["leader", "admin"] },
  { href: "/backoffice/relatorios", label: "Relatórios", roles: ["leader", "admin"] },
  { href: "/backoffice/agenda", label: "Agenda", roles: ["agent", "leader", "admin"] },
  { href: "/backoffice/automacao", label: "Automação", roles: ["leader", "admin"] },
  { href: "/backoffice/config", label: "Config", roles: ["admin"] },
];

export function Sidebar() {
  const { role } = useRole();
  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-[#2A2A2E] bg-[#151518] p-4 md:block">
      <div className="space-y-2">
        {links
          .filter((l) => l.roles.includes(role))
          .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded px-3 py-2 text-sm text-[#C5C5C5] hover:bg-[#0B0B0D] hover:text-white"
            >
              {link.label}
            </Link>
          ))}
      </div>
    </aside>
  );
}
