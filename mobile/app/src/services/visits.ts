/**
 * Serviço de API para Visitas
 * Baseado nas especificações do BACKEND_FRONTEND_VISITS.md
 */

import api from './api';
import { Visit, VisitStatus } from '../types';

export interface VisitFilters {
  status?: VisitStatus;
  date?: string;
  agent_id?: number;
  property_id?: number;
  lead_id?: number;
}

export interface VisitCreateInput {
  property_id: number;
  lead_id?: number;
  scheduled_at: string;
  duration_minutes?: number;
  notes?: string;
}

export interface CheckInData {
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface CheckOutData {
  notes?: string;
  client_feedback?: string;
  next_steps?: string;
}

const visitsService = {
  /**
   * Lista todas as visitas com filtros opcionais
   */
  async list(filters?: VisitFilters): Promise<Visit[]> {
    const response = await api.get('/visits', { params: filters });
    return response.data;
  },

  /**
   * Obtém detalhes de uma visita específica
   */
  async get(id: number): Promise<Visit> {
    const response = await api.get(`/visits/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova visita
   */
  async create(data: VisitCreateInput): Promise<Visit> {
    const response = await api.post('/visits', data);
    return response.data;
  },

  /**
   * Atualiza uma visita existente
   */
  async update(id: number, data: Partial<VisitCreateInput>): Promise<Visit> {
    const response = await api.put(`/visits/${id}`, data);
    return response.data;
  },

  /**
   * Remove uma visita
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/visits/${id}`);
  },

  /**
   * Check-in em uma visita (com coordenadas GPS)
   */
  async checkIn(id: number, data: CheckInData): Promise<Visit> {
    const response = await api.post(`/visits/${id}/check-in`, data);
    return response.data;
  },

  /**
   * Check-out de uma visita
   */
  async checkOut(id: number, data: CheckOutData): Promise<Visit> {
    const response = await api.post(`/visits/${id}/check-out`, data);
    return response.data;
  },

  /**
   * Cancela uma visita
   */
  async cancel(id: number, reason?: string): Promise<Visit> {
    const response = await api.post(`/visits/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Reagenda uma visita
   */
  async reschedule(id: number, newDate: string): Promise<Visit> {
    const response = await api.post(`/visits/${id}/reschedule`, {
      scheduled_at: newDate,
    });
    return response.data;
  },

  /**
   * Obtém visitas do dia atual
   */
  async getToday(): Promise<Visit[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.list({ date: today });
  },

  /**
   * Obtém próximas visitas
   */
  async getUpcoming(limit: number = 5): Promise<Visit[]> {
    const response = await api.get('/visits/upcoming', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Obtém estatísticas de visitas do agente atual
   */
  async getStats(): Promise<{
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    today: number;
    week: number;
  }> {
    const response = await api.get('/visits/stats');
    return response.data;
  },
};

export default visitsService;
