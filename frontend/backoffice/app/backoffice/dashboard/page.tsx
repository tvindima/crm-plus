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
import { useRouter } from "next/navigation";

const kpis = [
  { title: "Total Imóveis Ativos", value: "24", icon: HomeIcon, tone: "from-[#E10600] via-[#ff4d7a] to-[#ff90c2]", border: "from-[#E10600] to-[#ff4d7a]" },
  { title: "Novas Leads /d", value: "8", icon: UserGroupIcon, tone: "from-[#3b82f6] via-[#5fa2ff] to-[#93c5fd]", border: "from-[#3b82f6] to-[#5fa2ff]" },
  { title: "Visitas Agendadas", value: "5", icon: CalendarIcon, tone: "from-[#14b8a6] via-[#2dd4bf] to-[#5eead4]", border: "from-[#14b8a6] to-[#2dd4bf]" },
];

const barData = [
  { label: "Lisboa", value: 38 },
  { label: "Porto", value: 34 },
  { label: "Gaja", value: 28 },
  { label: "Simra", value: 22 },
  { label: "Matos", value: 18 },
];

const pieData = [
  { label: "T2", value: 45, color: "#3b82f6" },
  { label: "T3", value: 30, color: "#a855f7" },
  { label: "Outros", value: 25, color: "#E10600" },
];

const activities = [
  { user: "User X", action: "adicionou um imóvel", color: "#E10600" },
  { user: "User Y", action: "marcou uma visita", color: "#3b82f6" },
  { user: "User X", action: "atualizou um imóvel", color: "#14b8a6" },
];

const quickActions = [
  { label: "Nova Lead", icon: PlusIcon },
  { label: "Angariação", icon: SparklesIcon },
  { label: "Agendar Visita", icon: CalendarIcon },
];

function GlowCard({ className, children, borderGradient }: { className?: string; children: React.ReactNode; borderGradient?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1117]/50 via-[#0a0b10]/80 to-[#060609]/90 blur-xl" />
      
      {/* Gradient border overlay */}
      {borderGradient && (
        <div className="absolute inset-0 rounded-2xl p-[2px]">
          <div className={`h-full w-full rounded-2xl bg-gradient-to-br ${borderGradient} opacity-60`} />
        </div>
      )}
      
      {/* Content container */}
      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-[#0e0f15]/95 via-[#0a0b11]/90 to-[#08090d]/95 p-5 backdrop-blur-sm">
        <div className={clsx(className)}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

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
            <GlowCard key={kpi.title} borderGradient={kpi.border}>
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
                const colors = ["from-[#3b82f6] to-[#1d4ed8]", "from-[#5fa2ff] to-[#3b82f6]", "from-[#60a5fa] to-[#2563eb]", "from-[#3b82f6] to-[#1e40af]", "from-[#2563eb] to-[#1e3a8a]"];
                return (
                  <div key={bar.label} className="flex flex-col items-center gap-3">
                    <div
                      className={clsx(
                        "relative w-full max-w-[120px] rounded-t-xl bg-gradient-to-t shadow-[0_-8px_30px_rgba(59,130,246,0.4)] transition hover:scale-[1.05]",
                        colors[idx % colors.length],
                      )}
                      style={{ height: `${bar.value * 3}px` }}
                    />
                    <span className="text-xs text-[#9CA3AF] md:text-sm">{bar.label}</span>
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
                const btnColors = ["from-[#3b82f6] to-[#2563eb]", "from-[#a855f7] to-[#7c3aed]", "from-[#3b82f6] to-[#1d4ed8]"];
                const navigateTo = idx === 0 ? "/backoffice/leads" : idx === 1 ? "/backoffice/properties" : "/backoffice/agenda";
                
                return (
                  <button
                    key={action.label}
                    onClick={() => router.push(navigateTo)}
                    className={clsx(
                      "group flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm text-white transition hover:-translate-y-[2px] hover:shadow-[0_15px_35px_rgba(59,130,246,0.5)]",
                      "cursor-pointer",
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
            const tileColors = ["from-[#3b82f6] to-[#2563eb]", "from-[#a855f7] to-[#7c3aed]", "from-[#3b82f6] to-[#1d4ed8]"];
            return (
              <GlowCard key={action.label}>
                <div
                  className={clsx(
                    "flex h-24 items-center justify-center gap-3 rounded-xl bg-gradient-to-br text-white shadow-[0_10px_30px_rgba(59,130,246,0.4)]",
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
