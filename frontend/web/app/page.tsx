export default function Home() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary-500">CRM PLUS Command Center</h1>
        <p className="text-slate-600">
          Comece a gerir imoveis, leads e visitas a partir deste painel. As ligacoes com Idealista, Imovirtual e
          Fotocasa serao configuradas em modulos dedicados.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Estate Snapshot</p>
          <p className="mt-2 text-2xl font-bold">0 propriedades ativas</p>
          <p className="text-sm text-slate-500">Configure integracoes para sincronizar o seu portefolio.</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Lead Health</p>
          <p className="mt-2 text-2xl font-bold">0 leads abertas</p>
          <p className="text-sm text-slate-500">Ative o scoring inteligente para priorizar contactos.</p>
        </article>
      </div>
    </section>
  );
}
