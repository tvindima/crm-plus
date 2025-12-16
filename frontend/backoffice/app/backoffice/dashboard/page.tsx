'use client';

import { useEffect, useState } from "react";
import {
  SparklesIcon,
  BoltIcon,
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  CheckCircleIcon,
  UserIcon,
  ChartBarIcon,
  MegaphoneIcon,
  CalculatorIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  LightBulbIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { BackofficeLayout } from "@/backoffice/components/BackofficeLayout";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getBackofficeProperties } from "@/src/services/backofficeApi";
import { getSession } from "../../../src/services/auth";
import Image from "next/image";

type KPI = {
  title: string;
  value: string | number;
  icon: any;
  iconColor: string;
  bgGradient: string;
};

type Lead = {
  id: number;
  cliente: string;
  tipo: string;
  status: 'nova' | 'qualificada' | 'contacto';
  data: string;
};

type Activity = {
  id: number;
  acao: string;
  user: string;
  time: string;
};

type Tool = {
  id: number;
  name: string;
  icon: any;
  path: string;
  color: string;
};

// Mock data - substituir por chamadas API reais
const recentLeads: Lead[] = [
  { id: 1, cliente: "João Silva", tipo: "T2 - Lisboa", status: "nova", data: "Há 2 horas" },
  { id: 2, cliente: "Maria Santos", tipo: "T3 - Porto", status: "qualificada", data: "Há 5 horas" },
  { id: 3, cliente: "Pedro Costa", tipo: "Moradia - Gaia", status: "contacto", data: "Ontem" },
];

const recentActivities: Activity[] = [
  { id: 1, acao: "Nova visita agendada", user: "Tiago Vindima", time: "Há 30 min" },
  { id: 2, acao: "Proposta gerada para T3", user: "Bruno Libânio", time: "Há 1 hora" },
  { id: 3, acao: "Cliente adicionado", user: "Ana Vindima", time: "Há 2 horas" },
];

const intelligentTools: Tool[] = [
  { id: 1, name: "Gerir Agenda", icon: CalendarIcon, path: "/backoffice/calendario", color: "from-blue-500 to-cyan-500" },
  { id: 2, name: "Gerar Avaliação Imóvel", icon: CalculatorIcon, path: "/backoffice/avaliacoes", color: "from-purple-500 to-pink-500" },
  { id: 3, name: "Curar Post Redes Sociais", icon: MegaphoneIcon, path: "/backoffice/social", color: "from-orange-500 to-red-500" },
  { id: 4, name: "Notas & Ideias", icon: LightBulbIcon, path: "/backoffice/notas", color: "from-green-500 to-emerald-500" },
];

const barData = [
  { label: "Lisboa", value: 38 },
  { label: "Porto", value: 34 },
  { label: "Gaia", value: 15 },
  { label: "Sines", value: 8 },
  { label: "Outros", value: 5 },
];

const pieData = [
  { label: "T1", value: 15, color: "#3b82f6" },
  { label: "T2", value: 45, color: "#a855f7" },
  { label: "T3", value: 30, color: "#E10600" },
  { label: "Outros", value: 10, color: "#14b8a6" },
];

const GlowCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={clsx(
      "relative group rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950 p-[1px]",
      "transition-all duration-300",
      "hover:scale-[1.02]",
      className
    )}
  >
    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
    <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-xl p-6 backdrop-blur-xl border border-white/5">
      {children}
    </div>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Utilizador");
  const [userRole, setUserRole] = useState<'agent' | 'coordinator' | 'admin'>('agent');
  const [kpis, setKpis] = useState<KPI[]>([
    { title: "Total Propriedades Ativas", value: "0", icon: HomeIcon, iconColor: "text-purple-400", bgGradient: "from-purple-500/20 to-pink-500/20" },
    { title: "Novas Leads (7d)", value: "0", icon: SparklesIcon, iconColor: "text-blue-400", bgGradient: "from-blue-500/20 to-cyan-500/20" },
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const session = await getSession();
      if (session) {
        setUserName(session.email || "Utilizador");
        // Detectar role do utilizador
        const role = session.role || 'agent'; // Assumir 'agent' por defeito
        setUserRole(role as 'agent' | 'coordinator' | 'admin');
      }

      const properties = await getBackofficeProperties({});
      const activeProperties = properties.filter((p) => p.status === 'available');

      setKpis([
        { 
          title: "Total Propriedades Ativas", 
          value: activeProperties.length.toString(), 
          icon: HomeIcon, 
          iconColor: "text-purple-400", 
          bgGradient: "from-purple-500/20 to-pink-500/20" 
        },
        { 
          title: "Novas Leads (7d)", 
          value: "12", // Mock - substituir por contagem real
          icon: SparklesIcon, 
          iconColor: "text-blue-400", 
          bgGradient: "from-blue-500/20 to-cyan-500/20" 
        },
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Lead['status']) => {
    const badges = {
      nova: { text: "Nova", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      qualificada: { text: "Qualificada", color: "bg-green-500/20 text-green-400 border-green-500/30" },
      contacto: { text: "Contacto", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    };
    return badges[status];
  };

  if (loading) {
    return (
      <BackofficeLayout title="Dashboard">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout title="Dashboard">
      <div className="p-6 max-w-[1800px] mx-auto">
        {/* Header com Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
            Bem-vindo de volta, {userName.split(' ')[0]}!
          </h1>
          <p className="text-neutral-400 text-lg">
            Aqui está um resumo da tua atividade hoje
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Coluna Principal (2/3) */}
          <div className="xl:col-span-2 space-y-6">
            {/* KPIs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {kpis.map((kpi, index) => (
                <GlowCard key={index}>
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "p-3 rounded-lg bg-gradient-to-br",
                      kpi.bgGradient
                    )}>
                      <kpi.icon className={clsx("w-8 h-8", kpi.iconColor)} />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">{kpi.title}</p>
                      <p className="text-3xl font-bold text-white">{kpi.value}</p>
                    </div>
                  </div>
                </GlowCard>
              ))}
            </motion.div>

            {/* Gráficos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Bar Chart - Propriedades por Concelho */}
              <GlowCard>
                <h3 className="text-lg font-semibold text-white mb-6">
                  Propriedades por concelho
                </h3>
                <div className="space-y-4">
                  {barData.map((item, index) => {
                    const maxValue = Math.max(...barData.map((d) => d.value));
                    const percentage = (item.value / maxValue) * 100;
                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-neutral-300">{item.label}</span>
                          <span className="text-neutral-400">{item.value}</span>
                        </div>
                        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlowCard>

              {/* Pie Chart - Distribuição por Tipologia */}
              <GlowCard>
                <h3 className="text-lg font-semibold text-white mb-6">
                  Distribuição por tipologia
                </h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      {pieData.map((item, index) => {
                        const startAngle = pieData.slice(0, index).reduce((sum, d) => sum + (d.value / 100) * 360, 0);
                        const angle = (item.value / 100) * 360;
                        const largeArc = angle > 180 ? 1 : 0;
                        const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                        const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                        const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                        const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);

                        return (
                          <motion.path
                            key={index}
                            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={item.color}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 0.8, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                          />
                        );
                      })}
                      {/* Centro branco (donut) */}
                      <circle cx="50" cy="50" r="25" fill="#0a0a0a" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">45%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-6">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-neutral-300">{item.label}</span>
                      <span className="text-sm text-neutral-400">({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </GlowCard>
            </motion.div>

            {/* Leads Recentes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GlowCard>
                <h3 className="text-lg font-semibold text-white mb-4">Leads Recentes</h3>
                <div className="space-y-3">
                  {recentLeads.map((lead) => {
                    const badge = getStatusBadge(lead.status);
                    return (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <UserIcon className="w-5 h-5 text-neutral-400" />
                          <div>
                            <p className="text-sm font-medium text-white">{lead.cliente}</p>
                            <p className="text-xs text-neutral-400">{lead.tipo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={clsx("text-xs px-2 py-1 rounded-full border", badge.color)}>
                            {badge.text}
                          </span>
                          <span className="text-xs text-neutral-500">{lead.data}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlowCard>
            </motion.div>

            {/* Cards de Gestão */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Gestão de Leads */}
              <GlowCard>
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                      <SparklesIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Gestão de Leads</h3>
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    <button
                      onClick={() => router.push('/backoffice/leads/nova')}
                      className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                    >
                      Nova Lead
                    </button>
                    <button
                      onClick={() => router.push('/backoffice/leads')}
                      className="w-full py-2 px-4 rounded-lg bg-neutral-800 text-neutral-300 font-medium hover:bg-neutral-700 transition-all"
                    >
                      Qualificar Leads
                    </button>
                  </div>
                </div>
              </GlowCard>

              {/* Gestão de Propriedades - Condicional para role */}
              <GlowCard>
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <HomeIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Gestão de Propriedades</h3>
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    {/* Botão "Nova Propriedade" apenas para coordinator/admin */}
                    {(userRole === 'coordinator' || userRole === 'admin') && (
                      <button
                        onClick={() => router.push('/backoffice/properties/new')}
                        className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                      >
                        Nova Propriedade
                      </button>
                    )}
                    <button
                      onClick={() => router.push('/backoffice/propostas/nova')}
                      className="w-full py-2 px-4 rounded-lg bg-neutral-800 text-neutral-300 font-medium hover:bg-neutral-700 transition-all"
                    >
                      Gerar Proposta
                    </button>
                  </div>
                </div>
              </GlowCard>

              {/* Gestão de Agenda */}
              <GlowCard>
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                      <CalendarIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Gestão de Agenda</h3>
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    <button
                      onClick={() => router.push('/backoffice/visitas/nova')}
                      className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:shadow-lg hover:shadow-green-500/50 transition-all"
                    >
                      Agendar Visita
                    </button>
                    <button
                      onClick={() => router.push('/backoffice/tarefas/nova')}
                      className="w-full py-2 px-4 rounded-lg bg-neutral-800 text-neutral-300 font-medium hover:bg-neutral-700 transition-all"
                    >
                      Atribuir Tarefa
                    </button>
                  </div>
                </div>
              </GlowCard>
            </motion.div>

            {/* Ferramentas & Análises */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Ferramentas & Análises</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="cursor-pointer" onClick={() => router.push('/backoffice/analise-mercado')}>
                  <GlowCard>
                    <div className="text-center">
                      <ChartBarIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white">Análises de Mercado</p>
                    </div>
                  </GlowCard>
                </div>
                <div className="cursor-pointer" onClick={() => router.push('/backoffice/relatorios')}>
                  <GlowCard>
                    <div className="text-center">
                      <DocumentTextIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white">Sistema de Relatórios</p>
                    </div>
                  </GlowCard>
                </div>
                <div className="cursor-pointer" onClick={() => router.push('/backoffice/campanhas')}>
                  <GlowCard>
                    <div className="text-center">
                      <MegaphoneIcon className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white">Campanhas Marketing</p>
                    </div>
                  </GlowCard>
                </div>
                <div className="cursor-pointer" onClick={() => router.push('/backoffice/comunicacao')}>
                  <GlowCard>
                    <div className="text-center">
                      <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white">Comunicação Cliente</p>
                    </div>
                  </GlowCard>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Direita (1/3) - Assistente IA */}
          <div className="space-y-6">
            {/* Assistente IA Pessoal */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlowCard>
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-1">
                    <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center">
                      <SparklesIcon className="w-12 h-12 text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Assistente IA Pessoal</h3>
                  <p className="text-sm text-neutral-400">Seu assistente inteligente 24/7</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-neutral-300 mb-3">Ferramentas Inteligentes</h4>
                  {intelligentTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => router.push(tool.path)}
                      className={clsx(
                        "w-full p-3 rounded-lg flex items-center gap-3",
                        "bg-neutral-800/50 hover:bg-neutral-800 transition-all",
                        "group"
                      )}
                    >
                      <div className={clsx(
                        "p-2 rounded-lg bg-gradient-to-br",
                        tool.color
                      )}>
                        <tool.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                        {tool.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white mb-1">Olá {userName.split(' ')[0]}!</p>
                      <p className="text-xs text-neutral-400">
                        Em que posso ajudar-te hoje? Posso ajudar-te com análises, relatórios, ou responder às tuas questões.
                      </p>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                    Iniciar Conversa
                  </button>
                </div>
              </GlowCard>
            </motion.div>

            {/* Atividades Recentes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GlowCard>
                <h3 className="text-lg font-semibold text-white mb-4">Gestão - Novidades</h3>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
                    >
                      <div className="p-2 rounded-full bg-blue-500/20 flex-shrink-0">
                        <BoltIcon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{activity.acao}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-neutral-400">{activity.user}</span>
                          <span className="text-xs text-neutral-500">•</span>
                          <span className="text-xs text-neutral-500">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </div>
      </div>
    </BackofficeLayout>
  );
}
