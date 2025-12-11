import { notFound } from "next/navigation";
import { getAgents } from "../../../src/services/publicApi";
import Link from "next/link";

type Props = { params: { slug: string } };

export default async function AgentDetail({ params }: Props) {
  const agents = await getAgents(50);
  const agent = agents.find((a) => encodeURIComponent(a.name || "").toLowerCase() === params.slug.toLowerCase()) || null;
  if (!agent) notFound();

  return (
    <div className="space-y-4">
      <Link href="/agentes" className="text-sm text-[#E10600] hover:underline">
        ← Todos os agentes
      </Link>
      <div className="rounded-2xl border border-[#2A2A2E] bg-[#151518] p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#E10600]">Agente</p>
        <h1 className="text-3xl font-semibold text-white">{agent.name}</h1>
        <p className="text-sm text-[#C5C5C5]">{agent.email}</p>
        <p className="text-sm text-[#C5C5C5]">{agent.phone || "—"}</p>
        {agent.team && <p className="text-sm text-[#C5C5C5]">Equipa: {agent.team}</p>}
      </div>
    </div>
  );
}
