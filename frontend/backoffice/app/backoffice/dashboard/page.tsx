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
  { title: "Total Imóveis Ativos", value: "24", icon: HomeIcon, tone: "from-[#ff3864] via-[#ff5f7f] to-[#ff90c2]" },
  { title: "Novas Leads /d", value: "8", icon: UserGroupIcon, tone: "from-[#5a6bff] via-[#7e8dff] to-[#b2c3ff]" },
  { title: "Visitas Agendadas", value: "5", icon: CalendarIcon, tone: "from-[#3b9bff] via-[#5ec3ff] to-[#9fe1ff]" },
];

const barData = [
  { label: "Lisboa", value: 38 },
  { label: "Porto", value: 34 },
  { label: "Gaja", value: 28 },
  { label: "Simra", value: 22 },
  { label: "Matos", value: 18 },
];

const pieData = [
  { label: "T2", value: 45, color: "#4b9dff" },
  { label: "T3", value: 30, color: "#ff4d7a" },
  { label: "Outros", value: 25, color: "#8b5cf6" },
];

const activities = [
  { user: "User X", action: "adicionou um imóvel", color: "#ff4d7a" },
  { user: "User Y", action: "marcou uma visita", color: "#3b9bff" },
  { user: "User X", action: "atualizou um imóvel", color: "#2dd4bf" },
];

const quickActions = [
  { label: "Nova Lead", icon: PlusIcon },
  { label: "Angariação", icon: SparklesIcon },
  { label: "Agendar Visita", icon: CalendarIcon },
];

function GlowCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2b4a]/45 via-[#111828]/70 to-[#0b0c14]/90 blur-2xl opacity-90" />
      <div className="absolute inset-0 rounded-3xl border border-[#4bc2ff]/25 shadow-[0_20px_70px_rgba(64,121,255,0.35)]" />
      <div className="relative rounded-3xl border border-white/8 bg-gradient-to-br from-[#0A0A0E]/94 via-[#0C0C12]/88 to-[#07070c]/94 p-[1px] shadow-[0_30px_80px_rgba(5,11,30,0.75)]">
        <div className={clsx("rounded-[22px] bg-gradient-to-br from-[#0B0C12]/92 via-[#0C1019]/88 to-[#0A0A11]/92 p-5 backdrop-blur-xl", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <BackofficeLayout title="Dashboard">
      <div className="relative overflow-hidden rounded-3xl border border-[#23345c] bg-gradient-to-br from-[#050711] via-[#080c18] to-[#04050d] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.75)] md:p-6">
        {/* Glow envelope do dashboard */}
        <div className="pointer-events-none absolute -left-14 -top-20 h-72 w-72 rounded-full bg-[#3b82f6]/30 blur-[150px]" />
        <div className="pointer-events-none absolute -right-16 top-6 h-64 w-64 rounded-full bg-[#7c3aed]/25 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-80 w-80 rounded-full bg-[#ff4d7a]/18 blur-[170px]" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-[#4bc2ff]/18" />

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#E10600]">CRM PLUS · Backoffice</p>
            <h1 className="text-3xl font-semibold text-white">Visão geral</h1>
            <p className="text-sm text-[#C5C5C5]">Operação em tempo real: imóveis, leads, visitas e produtividade.</p>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-[#0F0F12] px-4 py-2 ring-1 ring-[#23232B] shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ff4d7a] to-[#ff8fb8] shadow-[0_0_30px_rgba(255,77,122,0.6)]" />
            <div className="text-sm">
              <p className="text-white">Tiago V.</p>
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
                    "relative overflow-hidden rounded-2xl p-3 text-white shadow-[0_16px_40px_rgba(68,142,255,0.45)] ring-1 ring-[#60a5fa]/25",
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
            </div>
            <div className="mt-8 grid h-60 grid-cols-5 items-end gap-4 md:h-72 md:gap-6">
              {barData.map((bar, idx) => {
                const colors = ["from-[#5fa2ff] to-[#2d63ff]", "from-[#6c7bff] to-[#4b56ff]", "from-[#8b5cf6] to-[#d946ef]", "from-[#ff5f7f] to-[#ff90c2]", "from-[#4dd4bf] to-[#2ac7a6]"];
                return (
                  <div key={bar.label} className="flex flex-col items-center gap-3">
                    <div
                      className={clsx(
                        "relative w-full max-w-[120px] rounded-2xl bg-gradient-to-t shadow-[0_-12px_40px_rgba(95,162,255,0.45)] ring-1 ring-[#4bc2ff]/25 transition hover:scale-[1.05]",
                        colors[idx % colors.length],
                      )}
                      style={{ height: `${bar.value * 3}px` }}
                    />
                    <span className="text-xs text-[#C5C5C5] md:text-sm">{bar.label}</span>
                  </div>
                );
              })}
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
                <div className="absolute inset-6 flex items-center justify-center rounded-full bg-[#0F0F10] text-white shadow-inner shadow-[#3b82f6]/25">
                  <div className="text-center">
                    <p className="text-xs text-[#C5C5C5]">T2</p>
                    <p className="text-xl font-semibold text-white">45%</p>
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
              <p className="text-lg font-semibold text-white">Atividades Recentes</p>
            </div>
            <div className="mt-4 space-y-3">
              {activities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0F0F12]/80 px-4 py-3 transition hover:border-[#5fa2ff]"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                    <div className="space-y-1">
                      <p className="text-sm text-white">
                        <span className="font-semibold">{item.user}</span> {item.action}
                      </p>
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
              <BoltIcon className="h-5 w-5 text-[#5fa2ff]" />
            </div>
            <div className="grid gap-3">
              {quickActions.map((action, idx) => {
                const btnColors = ["from-[#0f5afc] to-[#4bc2ff]", "from-[#6c7bff] to-[#a78bfa]", "from-[#ff5f7f] to-[#ff90c2]"];
                return (
                  <button
                    key={action.label}
                    className={clsx(
                      "group flex items-center justify-between rounded-2xl border border-white/10 bg-[#0F0F12]/80 px-4 py-3 text-left text-sm text-white transition hover:-translate-y-[1px] hover:shadow-[0_18px_40px_rgba(79,139,255,0.35)]",
                      "ring-1 ring-white/5",
                      `bg-gradient-to-br ${btnColors[idx]}`,
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-[#111114] p-2 text-white shadow-inner shadow-black/40">
                        <action.icon className="h-5 w-5" />
                      </span>
                      <span>{action.label}</span>
                    </div>
                    <span className="text-xs text-white/90 group-hover:text-white">começar</span>
                  </button>
                );
              })}
            </div>
          </GlowCard>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {quickActions.map((action, idx) => {
            const tileColors = ["from-[#0f5afc] to-[#4bc2ff]", "from-[#7c3aed] to-[#a855f7]", "from-[#ff5f7f] to-[#ff90c2]"];
            return (
              <GlowCard key={action.label} className="p-4">
                <div
                  className={clsx(
                    "flex h-28 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br text-white shadow-[0_15px_40px_rgba(79,139,255,0.3)]",
                    tileColors[idx % tileColors.length],
                  )}
                >
                  <action.icon className="h-6 w-6" />
                  <span className="text-base font-semibold">{action.label}</span>
                </div>
              </GlowCard>
            );
          })}
        </div>
      </div>
    </BackofficeLayout>
  );
}
