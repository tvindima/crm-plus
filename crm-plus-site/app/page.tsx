import Link from "next/link";

const bullets = [
  "Automação e routing de leads para equipas/agentes",
  "Dashboards e feed em tempo real",
  "Website e montra integrados com o CRM",
  "Notificações, billing e relatórios unificados",
];

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-16">
      <section className="space-y-6">
        <p className="text-sm uppercase tracking-[0.2em] text-[#E10600]">CRM PLUS · B2B</p>
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">A plataforma completa para a tua agência imobiliária</h1>
        <p className="max-w-3xl text-lg text-[#C5C5C5]">
          Captura leads, automatiza follow-ups, integra website, agenda e faturação num só lugar. Escala operações com segurança e performance.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="#funcionalidades"
            className="rounded-full bg-gradient-to-r from-[#E10600] to-[#a10600] px-5 py-3 text-sm font-semibold shadow-[0_0_16px_rgba(225,6,0,0.6)]"
          >
            Ver funcionalidades
          </Link>
          <Link
            href="#contacto"
            className="rounded-full border border-[#2A2A2E] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#E10600]"
          >
            Falar com a equipa
          </Link>
        </div>
      </section>

      <section id="funcionalidades" className="grid gap-4 rounded-2xl border border-[#1F1F22] bg-[#0F0F10] p-6">
        <h2 className="text-2xl font-semibold text-white">Funcionalidades-chave</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {bullets.map((item) => (
            <div key={item} className="rounded-xl border border-[#1F1F22] bg-[#0B0B0D] p-4 text-sm text-[#C5C5C5]">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="contacto" className="space-y-3 rounded-2xl border border-[#1F1F22] bg-[#0F0F10] p-6">
        <h3 className="text-xl font-semibold text-white">Queres uma demo?</h3>
        <p className="text-sm text-[#C5C5C5]">Entra em contacto para conhecer o CRM PLUS e como integrar com a tua agência.</p>
        <a
          href="mailto:contact@crmplus.com"
          className="inline-flex w-fit items-center rounded-full bg-gradient-to-r from-[#E10600] to-[#a10600] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_12px_rgba(225,6,0,0.6)]"
        >
          Pedir demo
        </a>
      </section>
    </main>
  );
}
