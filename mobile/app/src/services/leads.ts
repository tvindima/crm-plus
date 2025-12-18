/**
 * Serviço de API para Leads
 */

import api from './api';
import { Lead, LeadStatus, LeadSource } from '../types';

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  agent_id?: number;
}

export interface LeadCreateInput {
  name: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  property_interest_id?: number;
}

const leadsService = {
  /**
   * Lista todos os leads com filtros opcionais
   */
  async list(filters?: LeadFilters): Promise<Lead[]> {
    const response = await api.get('/leads', { params: filters });
    return response.data;
  },

  /**
   * Obtém detalhes de um lead específico
   */
  async get(id: number): Promise<Lead> {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  /**
   * Cria um novo lead
   */
  async create(data: LeadCreateInput): Promise<Lead> {
    const response = await api.post('/leads', data);
    return response.data;
  },

  /**
   * Atualiza um lead existente
   */
  async update(id: number, data: Partial<LeadCreateInput>): Promise<Lead> {
    const response = await api.put(`/leads/${id}`, data);
    return response.data;
  },

  /**
   * Atualiza apenas o status de um lead
   */
  async updateStatus(id: number, status: LeadStatus): Promise<Lead> {
    const response = await api.patch(`/leads/${id}/status`, { status });
    return response.data;
  },

  /**
   * Remove um lead
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/leads/${id}`);
  },

  /**
   * Obtém leads de um agente específico
   */
  async getByAgent(agentId: number): Promise<Lead[]> {
    const response = await api.get(`/agents/${agentId}/leads`);
    return response.data;
  },

  /**
   * Obtém estatísticas de leads do agente atual
   */
  async getStats(): Promise<{
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
    lost: number;
  }> {
    const response = await api.get('/leads/stats');
    return response.data;
  },

  /**
   * Adiciona uma nota ao histórico do lead
   */
  async addNote(id: number, note: string): Promise<Lead> {
    const response = await api.post(`/leads/${id}/notes`, { note });
    return response.data;
  },

  /**
   * Registra uma interação com o lead
   */
  async logInteraction(
    id: number,
    data: {
      type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'other';
      notes?: string;
    }
  ): Promise<void> {
    await api.post(`/leads/${id}/interactions`, data);
  },
};

export default leadsService;
