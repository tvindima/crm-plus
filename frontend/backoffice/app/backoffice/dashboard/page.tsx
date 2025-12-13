'use client';

import {
  SparklesIcon,
  BoltIcon,
  CalendarIcon,
  PlusIcon,
  UserGroupIcon,
  HomeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { BackofficeLayout } from "../../../backoffice/components/BackofficeLayout";
import clsx from "clsx";

const kpis = [
  { title: "Total Imóveis", value: "15", icon: HomeIcon, tone: "from-[#E10600] via-[#ff4040] to-[#ff8080]" },
  { title: "Novas Leads/d", value: "12", icon: UserGroupIcon, tone: "from-[#0EA5E9] via-[#5EC1FF] to-[#9AD8FF]" },
  { title: "Visitas Agendadas", value: "7", icon: CalendarIcon, tone: "from-[#22C55E] via-[#4ADE80] to-[#8af0af]" },
];

const barData = [
  { label: "Nazaré", value: 6.8 },
  { label: "Batalha", value: 4.5 },
  { label: "Leiria", value: 2.0 },
];

const pieData = [
  { label: "T3", value: 55, color: "#E10600" },
  { label: "T2", value: 25, color: "#0EA5E9" },
  { label: "Outros", value: 20, color: "#F97316" },
];

const activities = [
  { user: "Pedro Olaio", action: "editou o imóvel", ref: "JR 1044", time: "há 3 min" },
  { user: "João Silva", action: "visita visitar", ref: "MB1026", time: "há 3 dias" },
  { user: "Nuno Faria", action: "editou MB1018", ref: "Abril 2024", time: "26/04/2024" },
];

const quickActions = [
  { label: "+ Nova Lead", icon: PlusIcon },
  { label: "Angariação", icon: SparklesIcon },
  { label: "Agendar Visita", icon: CalendarIcon },
];

function GlowCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-[#E10600]/5 to-transparent blur-3xl opacity-50" />
      <div className="relative rounded-3xl border border-white/8 bg-gradient-to-br from-[#0A0A0E]/90 via-[#0C0C11]/80 to-[#09090C]/90 p-[1px] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className={clsx("rounded-[22px] bg-[#08080C]/80 p-5 backdrop-blur-xl", className)}>{children}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <BackofficeLayout title="Dashboard">
      <div className="relative overflow-hidden rounded-3xl border border-[#14141A] bg-[#06060A] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-[#E10600]/20 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#0EA5E9]/15 blur-[120px]" />

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#E10600]">CRM PLUS · Backoffice</p>
            <h1 className="text-3xl font-semibold text-white">Visão geral</h1>
            <p className="text-sm text-[#C5C5C5]">Operação em tempo real: imóveis, leads, visitas e produtividade.</p>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-[#0F0F12] px-4 py-2 ring-1 ring-[#23232B] shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#E10600] to-[#ff5959] shadow-[0_0_30px_rgba(225,6,0,0.6)]" />
            <div className="text-sm">
              <p className="text-white">Tiago Vindima</p>
              <p className="text-[#C5C5C5]">Staff</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {kpis.map((kpi) => (
            <GlowCard key={kpi.title}>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#C5C5C5]">{kpi.title}</p>
                  <p className="text-4xl font-semibold text-white drop-shadow-[0_5px_25px_rgba(0,0,0,0.4)]">{kpi.value}</p>
                </div>
                <div
                  className={clsx(
                    "rounded-2xl p-3 text-white shadow-[0_10px_30px_rgba(225,6,0,0.45)]",
                    `bg-gradient-to-br ${kpi.tone}`,
                  )}
                >
                  <kpi.icon className="h-7 w-7" />
                </div>
              </div>
            </GlowCard>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <GlowCard className="xl:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-white">Imóveis por concelho</p>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#C5C5C5] ring-1 ring-white/10">Últimos 30 dias</span>
            </div>
            <div className="mt-8 grid h-72 grid-cols-3 items-end gap-6">
              {barData.map((bar) => (
                <div key={bar.label} className="flex flex-col items-center gap-3">
                  <div
                    className="w-full max-w-[160px] rounded-2xl bg-gradient-to-t from-[#5c0a0a] via-[#BD0C0C] to-[#ff5757] shadow-[0_-12px_40px_rgba(225,6,0,0.55)] transition hover:scale-[1.05]"
                    style={{ height: `${bar.value * 22}px` }}
                  />
                  <span className="text-sm text-[#C5C5C5]">{bar.label}</span>
                </div>
              ))}
            </div>
          </GlowCard>

          <GlowCard className="flex flex-col gap-5">
            <p className="text-lg font-semibold text-white">Distribuição por tipologia</p>
            <div className="flex items-center gap-5">
              <div
                className="relative h-36 w-36 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
                style={{
                  background: `conic-gradient(${pieData[0].color} 0% ${pieData[0].value}%, ${pieData[1].color} ${pieData[0].value}% ${pieData[0].value + pieData[1].value}%, ${pieData[2].color} ${pieData[0].value + pieData[1].value}% 100%)`,
                }}
              >
                <div className="absolute inset-3 rounded-full bg-[#0A0A0D]/90 backdrop-blur" />
                <div className="absolute inset-6 flex items-center justify-center rounded-full bg-[#0F0F10] text-white shadow-inner shadow-[#E10600]/20">
                  <div className="text-center">
                    <p className="text-xs text-[#C5C5C5]">Tipologia</p>
                    <p className="text-xl font-semibold text-white">100%</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-sm text-[#C5C5C5]">
                {pieData.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                    <span className="text-white">{item.label}</span>
                    <span className="text-[#9CA3AF]">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </GlowCard>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <GlowCard className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-semibold text-white">Atividade recente</p>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#C5C5C5]">Real-time feed</span>
            </div>
            <div className="mt-4 space-y-3">
              {activities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0F0F12]/80 px-4 py-3 transition hover:border-[#E10600]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#E10600] to-[#a10600] shadow-[0_0_25px_rgba(225,6,0,0.5)]" />
                    <div className="space-y-1">
                      <p className="text-sm text-white">
                        <span className="font-semibold">{item.user}</span> {item.action} <span className="text-[#E5E7EB]">{item.ref}</span>
                      </p>
                      <p className="text-xs text-[#C5C5C5]">{item.time}</p>
                    </div>
                  </div>
                  <CheckCircleIcon className="h-5 w-5 text-[#22C55E]" />
                </div>
              ))}
            </div>
          </GlowCard>

          <GlowCard className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-white">Ações rápidas</p>
              <BoltIcon className="h-5 w-5 text-[#E10600]" />
            </div>
            <div className="grid gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#0F0F12]/80 px-4 py-3 text-left text-sm text-white transition hover:-translate-y-[1px] hover:border-[#E10600] hover:shadow-[0_15px_35px_rgba(225,6,0,0.25)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#111114] p-2 text-[#E10600] shadow-inner">
                      <action.icon className="h-5 w-5" />
                    </span>
                    <span>{action.label}</span>
                  </div>
                  <span className="text-xs text-[#C5C5C5] group-hover:text-white">começar</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0F0F12]/80 px-4 py-3 text-sm text-[#C5C5C5]">
              <CheckCircleIcon className="h-5 w-5 text-[#22C55E]" />
              <div>
                <p className="text-white">Follow-up leads</p>
                <p>Confirmar visitas e atualizar angariações</p>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    </BackofficeLayout>
  );
}
