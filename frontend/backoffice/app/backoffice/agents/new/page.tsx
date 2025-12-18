'use client';

import { useState } from 'react';
import { BackofficeLayout } from '@/backoffice/components/BackofficeLayout';
import { ToastProvider, useToast } from '@/backoffice/components/ToastProvider';

interface AgentFormData {
  name: string;
  email: string;
  phone: string;
  tax_id: string;
  address: string;
  role: 'agent' | 'team_leader' | 'manager' | 'admin';
  team_leader_id: number | null;
  license_number: string;
  hire_date: string;
  linkedin_url: string;
  facebook_url: string;
  instagram_url: string;
  video_url: string;
  emergency_contact: string;
  is_active: boolean;
  can_receive_leads: boolean;
  max_properties: number | null;
  commission_rate: number | null;
  // Novos campos RH
  employee_type: 'comercial' | 'staff';
  staff_position: string; // Cargo se for staff
  team_id: number | null; // Equipa se for comercial
  contract_type: 'permanent' | 'temporary' | 'freelance' | 'internship';
  contract_start: string;
  contract_end: string | null; // Null = contrato permanente
  contract_renewal_alert_days: number; // Dias de antecedência para alerta
}

export default function NewAgentPage() {
  return (
    <ToastProvider>
      <NewAgentInner />
    </ToastProvider>
  );
}

function NewAgentInner() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Array<{ id: number; name: string }>>([]);
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    email: '',
    phone: '',
    tax_id: '',
    address: '',
    role: 'agent',
    team_leader_id: null,
    license_number: '',
    hire_date: '',
    linkedin_url: '',
    facebook_url: '',
    instagram_url: '',
    video_url: '',
    emergency_contact: '',
    is_active: true,
    can_receive_leads: true,
    max_properties: 50,
    commission_rate: 3.5,
    // Novos campos RH
    employee_type: 'comercial',
    staff_position: '',
    team_id: null,
    contract_type: 'permanent',
    contract_start: '',
    contract_end: null,
    contract_renewal_alert_days: 60,
  });

  // Carregar lista de agentes para o dropdown
  useState(() => {
    async function loadAgents() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://crm-plus-production.up.railway.app'}/agents/?limit=100`
        );
        if (!response.ok) return;
        const data = await response.json();
        setAgents(data.filter((a: any) => a.name !== 'Imóveis Mais Leiria'));
      } catch (error) {
        console.error('Erro ao carregar agentes:', error);
      }
    }
    loadAgents();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast?.push('Preencha os campos obrigatórios', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://crm-plus-production.up.railway.app'}/agents/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error('Erro ao criar agente');

      toast?.push('Agente criado com sucesso!', 'success');
      setTimeout(() => {
        window.location.href = '/backoffice/agents';
      }, 1500);
    } catch (error) {
      console.error('Erro ao criar agente:', error);
      toast?.push('Erro ao criar agente', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackofficeLayout title="Novo Agente">
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-4 md:space-y-6 pb-8">
        {/* SECÇÃO 1: Dados Básicos */}
        <section className="rounded-2xl border border-[#1F1F22] bg-[#0F0F10] p-4 md:p-6">
          <h2 className="mb-3 md:mb-4 text-base md:text-lg font-semibold text-white">Dados Básicos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">
                Nome Completo <span className="text-[#E10600]">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                placeholder="Tiago Vindima"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">
                Email <span className="text-[#E10600]">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                placeholder="tiago@imoveismais.pt"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">
                Telefone <span className="text-[#E10600]">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                placeholder="+351 912 345 678"
                required
              />
            </div>Tipo de RH */}
        <section className="rounded-2xl border border-[#1F1F22] bg-[#0F0F10] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Tipo de Recursos Humanos</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">
                Tipo de RH <span className="text-[#E10600]">*</span>
              </label>
              <select
                value={formData.employee_type}
                onChange={(e) => setFormData({ ...formData, employee_type: e.target.value as any })}
                className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
              >
                <option value="comercial">RH Comercial</option>
                <option value="staff">RH Staff</option>
              </select>
            </div>

            {/* Se for COMERCIAL → Mostrar Equipa */}
            {formData.employee_type === 'comercial' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Pertence à Equipa de</label>
                <select
                  value={formData.team_id || ''}
                  onChange={(e) => setFormData({ ...formData, team_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                >
                  <option value="">Selecionar agente...</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Se for STAFF → Mostrar Responsável + Cargo */}
            {formData.employee_type === 'staff' && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Responsável</label>
                  <select
                    value={formData.team_leader_id || ''}
                    onChange={(e) => setFormData({ ...formData, team_leader_id: e.target.value ? Number(e.target.value) : null })}
                    className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                  >
                    <option value="">Staff de Loja (sem responsável direto)</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">
                    Cargo <span className="text-[#E10600]">*</span>
                  </label>
                  <select
                    value={formData.staff_position}
                    onChange={(e) => setFormData({ ...formData, staff_position: e.target.value })}
                    className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                  >
                    <option value="">Selecionar cargo...</option>
                    <option value="Rececionista">Rececionista</option>
                    <option value="Assistente Administrativo">Assistente Administrativo</option>
                    <option value="Coordenador Administrativo">Coordenador Administrativo</option>
                    <option value="Gestor de Marketing">Gestor de Marketing</option>
                    <option value="Designer Gráfico">Designer Gráfico</option>
                    <option value="Fotógrafo">Fotógrafo</option>
                    <option value="Técnico de IT">Técnico de IT</option>
                    <option value="Contabilista">Contabilista</option>
                    <option value="Jurista">Jurista</option>
                    <option value="Facility Manager">Facility Manager</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </>
            )}
          </div>5: Presença Online (só para Comerciais) */}
        {formData.employee_type === 'comercial' && (
          <section className="rounded-2xl border border-[#1F1F22] bg-[#0F0F10] p-6">
  
        {/* SECÇÃO 3: Hierarquia e Certificação (só para Comerciais) */}
        {formData.employee_type === 'comercial' && (
          <section className="rounded-2xl border border-[#1F1F22] bg-[#0F0F10] p-4 md:p-6">
            <h2 className="mb-3 md:mb-4 text-base md:text-lg font-semibold text-white">Hierarquia e Certificação</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Função</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                >
                  <option value="agent">Agente</option>
                  <option value="team_leader">Chefe de Equipa</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Número AMI</label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                  placeholder="AMI 12345"
                />
              </div>
            </div>
          </section>
        )}

        {/* SECÇÃO 4: Contrato */}
        <section className="rounded-2xl border border-[#1F1F22] bg-[#0F0F10] p-4 md:p-6">
          <h2 className="mb-3 md:mb-4 text-base md:text-lg font-semibold text-white">Dados de Contrato</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">
                Tipo de Contrato <span className="text-[#E10600]">*</span>
              </label>
              <select
                value={formData.contract_type}
          </section>
        )}

        {/* SECÇÃO 6: Configurações (só para Comerciais) */}
        {formData.employee_type === 'comercial' && (
                  <option value="permanent">Contrato Permanente (Sem Termo)</option>
                <option value="temporary">Contrato a Termo Certo</option>
                <option value="freelance">Prestador de Serviços / Freelancer</option>
                <option value="internship">Estágio Profissional</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">
                Data de Início <span className="text-[#E10600]">*</span>
              </label>
              <input
                type="date"
                value={formData.contract_start}
                onChange={(e) => setFormData({ ...formData, contract_start: e.target.value })}
                className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                required
              />
            </div>

            {/* Mostrar data fim apenas se NÃO for permanente */}
            {formData.contract_type !== 'permanent' && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">
                    Data de Fim do Contrato <span className="text-[#E10600]">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.contract_end || ''}
                    onChange={(e) => setFormData({ ...formData, contract_end: e.target.value || null })}
                    className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">
                    Alerta de Renovação (dias antes)
                  </label>
                  <input
                    type="number"
                    value={formData.contract_renewal_alert_days}
                    onChange={(e) => setFormData({ ...formData, contract_renewal_alert_days: Number(e.target.value) })}
                    className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                    placeholder="60"
                    min="1"
                    max="365"
                  />
                  <p className="mt-1 text-xs text-[#888]">
                    Receberá alerta no dashboard {formData.contract_renewal_alert_days} dias antes do fim do contrato
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Data de Contratação (Oficial)
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Chefe de Equipa</label>
              <select
                value={formData.team_leader_id || ''}
                onChange={(e) => setFormData({ ...formData, team_leader_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
              >
                <option value="">Nenhum (independente)</option>
                <option value="20">Nuno Faria</option>
                <option value="21">Pedro Olaio</option>
                <option value="35">Tiago Vindima</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Número AMI</label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                placeholder="AMI 12345"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Data de Contratação</label>
              <input
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
              />
            </div>
          </div>
        </section>

        {/* SECÇÃO 3: Presença Online */}
        <section className="rounded-2xl border border-[#1F1F22] bg-[#0F0F10] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Presença Online</h2>

          <div className="space-y-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">LinkedIn</label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Facebook</label>
              <input
                type="url"
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Instagram</label>
              <input
                type="url"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Vídeo de Apresentação (YouTube)</label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>
        </section>

        {/* SECÇÃO 4: Configurações */}
        <section className="rounded-2xl border border-[#1F1F22] bg-[#0F0F10] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Configurações</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm text-[#C5C5C5]">Agente ativo (recebe leads)</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.can_receive_leads}
                onChange={(e) => setFormData({ ...formData, can_receive_leads: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm text-[#C5C5C5]">Pode receber leads automaticamente</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-3 md:mt-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Máx. Propriedades Simultâneas</label>
                <input
                  type="number"
                  value={formData.max_properties || ''}
                  onChange={(e) => setFormData({ ...formData, max_properties: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Taxa de Comissão (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.commission_rate || ''}
                  onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                  placeholder="3.5"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#C5C5C5]">Contacto de Emergência</label>
              <input
                type="text"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
                placeholder="Nome: João Silva, Tel: +351 912 345 678"
          </section>
        )}
            </div>
          </div>
        </section>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 sticky bottom-0 bg-[#070708] py-4 border-t border-[#1F1F22]">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto rounded bg-[#E10600] px-6 py-3 font-medium text-white transition-colors hover:bg-[#C10500] disabled:opacity-50"
          >
            {loading ? 'A guardar...' : 'Guardar Agente'}
          </button>
          <button
            type="button"
            onClick={() => window.location.href = '/backoffice/agents'}
            className="w-full sm:w-auto rounded bg-[#2A2A2E] px-6 py-3 font-medium text-white transition-colors hover:bg-[#3A3A3E]"
          >
            Cancelar
          </button>
        </div>
      </form>
    </BackofficeLayout>
  );
}
