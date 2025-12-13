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
import { motion } from "framer-motion";

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
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2b4a]/40 via-[#111828]/60 to-[#0b0c14]/80 blur-2xl opacity-90" />
      <div className="absolute inset-0 rounded-3xl border border-[#4bc2ff]/20 shadow-[0_20px_60px_rgba(0,149,255,0.28)]" />
      <div className="relative rounded-3xl border border-white/8 bg-gradient-to-br from-[#0A0A0E]/92 via-[#0C0C12]/86 to-[#07070c]/92 p-[1px] shadow-[0_25px_70px_rgba(5,11,30,0.7)]">
        <div className={clsx("rounded-[22px] bg-gradient-to-br from-[#0B0C12]/90 via-[#0C1019]/85 to-[#0A0A11]/90 p-5 backdrop-blur-xl", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <BackofficeLayout title="Dashboard">
      <div className="relative overflow-hidden rounded-3xl border border-[#1b2640] bg-gradient-to-br from-[#0b1224] via-[#0a0f1d] to-[#090a12] p-4 shadow-[0_35px_110px_rgba(0,0,0,0.7)] md:p-6">
        {/* Glow envelope do dashboard */}
        <div className="pointer-events-none absolute -left-14 -top-20 h-72 w-72 rounded-full bg-[#3b82f6]/25 blur-[130px]" />
        <div className="pointer-events-none absolute -right-16 top-6 h-64 w-64 rounded-full bg-[#7c3aed]/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-80 w-80 rounded-full bg-[#E10600]/14 blur-[160px]" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-[#4bc2ff]/15" />

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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => (
            <GlowCard key={kpi.title}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="relative flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-[#C5C5C5]">{kpi.title}</p>
                  <p className="text-4xl font-semibold text-white drop-shadow-[0_5px_25px_rgba(0,0,0,0.4)]">{kpi.value}</p>
                </div>
                <div
                  className={clsx(
                    "relative overflow-hidden rounded-2xl p-3 text-white shadow-[0_14px_35px_rgba(59,130,246,0.35)] ring-1 ring-[#60a5fa]/20",
                    `bg-gradient-to-br ${kpi.tone}`,
                  )}
                >
                  <div className="pointer-events-none absolute -inset-6 rounded-full bg-white/10 blur-2xl" />
                  <kpi.icon className="relative h-7 w-7 drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]" />
                </div>
              </motion.div>
            </GlowCard>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <GlowCard className="xl:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-white">Imóveis por concelho</p>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#C5C5C5] ring-1 ring-white/10">Últimos 30 dias</span>
            </div>
            <div className="mt-8 grid h-60 grid-cols-3 items-end gap-4 md:h-72 md:gap-6">
              {barData.map((bar) => (
                <div key={bar.label} className="flex flex-col items-center gap-3">
                  <div
                    className="relative w-full max-w-[160px] rounded-2xl bg-gradient-to-t from-[#0f5afc] via-[#7c3aed] to-[#ff5a5a] shadow-[0_-12px_40px_rgba(59,130,246,0.45)] ring-1 ring-[#60a5fa]/25 transition hover:scale-[1.05]"
                    style={{ height: `${bar.value * 18}px` }}
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
