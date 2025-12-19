/**
 * Serviço de API centralizado para comunicação com backend
 * Inclui interceptor para refresh automático de tokens
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';
import type { ApiError } from '../types';

class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else if (token) {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Refresh token inválido');
    }

    const data = await response.json();

    // Token rotation: atualizar ambos os tokens
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
    await AsyncStorage.setItem('expires_at', data.expires_at);

    this.setAccessToken(data.access_token);

    return data.access_token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('[API] 🌐 Request:', options.method || 'GET', url);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Interceptor: se 401 e não é retry, tentar refresh
      if (response.status === 401 && !isRetry) {
        if (this.isRefreshing) {
          // Já está refreshing, adicionar à fila
          return new Promise<T>((resolve, reject) => {
            this.failedQueue.push({
              resolve: (token: string) => {
                // Retry request com novo token
                this.setAccessToken(token);
                this.request<T>(endpoint, options, true)
                  .then(resolve)
                  .catch(reject);
              },
              reject,
            });
          });
        }

        // Iniciar refresh
        this.isRefreshing = true;

        try {
          const newToken = await this.refreshAccessToken();
          this.processQueue(null, newToken);

          // Retry request original com novo token
          return this.request<T>(endpoint, options, true);
        } catch (refreshError) {
          this.processQueue(refreshError, null);
          
          // Limpar storage e fazer logout
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER_DATA,
          ]);
          this.setAccessToken(null);

          throw refreshError;
        } finally {
          this.isRefreshing = false;
        }
      }

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        }));
        throw error;
      }

      return await response.json();
    } catch (error: any) {
      if (error.detail) {
        throw error;
      }
      throw {
        detail: error.message || 'Erro de conexão com o servidor',
        status: 0,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Mock responses para desenvolvimento quando backend estiver com problemas
  private getMockedResponse<T>(endpoint: string): T {
    console.log(`[API MOCK] Gerando resposta mockada para: ${endpoint}`);

    // Dashboard stats
    if (endpoint.includes('/mobile/dashboard/stats')) {
      return {
        properties: 12,
        leads: 8,
        visits: 5,
        conversions: 3,
      } as T;
    }

    // Upcoming visits
    if (endpoint.includes('/mobile/visits/upcoming')) {
      return [] as T; // Sem visitas mockadas por enquanto
    }

    // User info
    if (endpoint === '/auth/me') {
      return {
        id: 1,
        name: 'Tiago Vindima',
        email: 'tvindima@imoveismais.pt',
        role: 'admin',
        is_active: true,
        avatar: null,
      } as T;
    }

    // Default: retornar objeto vazio ou array vazio
    console.warn(`[API MOCK] Endpoint não mapeado: ${endpoint}, retornando []`);
    return [] as T;
  }
}

export const apiService = new ApiService();
