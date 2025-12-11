import { getAgents } from "../../src/services/publicApi";
import { SectionHeader } from "../../components/SectionHeader";
import Link from "next/link";

export default async function AgentesPage() {
  const agents = await getAgents(50);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Equipa"
        title="Agentes CRM PLUS"
        subtitle="Microsites individuais para cada consultor. Dados vindos da API ou mocks."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Link
            href={`/agentes/${encodeURIComponent(agent.name || agent.id)}`}
            key={agent.id}
            className="rounded-xl border border-[#2A2A2E] bg-[#151518] p-4 transition hover:border-[#E10600]"
          >
            <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
            <p className="text-sm text-[#C5C5C5]">{agent.email}</p>
            <p className="text-sm text-[#C5C5C5]">{agent.phone || "—"}</p>
            {agent.team && <span className="text-xs text-[#E10600]">Equipa: {agent.team}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
