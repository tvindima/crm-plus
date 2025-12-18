/**
 * Serviço de autenticação JWT
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';
import { STORAGE_KEYS } from '../constants/config';
import type { User, AuthTokens } from '../types';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    // Backend espera FormData para OAuth2
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${apiService['baseURL']}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: 'Erro ao fazer login',
      }));
      throw new Error(error.detail || 'Credenciais inválidas');
    }

    const data: LoginResponse = await response.json();

    // Salvar tokens e usuário
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
    if (data.refresh_token) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));

    // Configurar token no apiService
    apiService.setAccessToken(data.access_token);

    return data.user;
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
    apiService.setAccessToken(null);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) return null;

      apiService.setAccessToken(token);
      
      const user = await apiService.get<User>('/auth/me');
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return user;
    } catch (error) {
      await this.logout();
      return null;
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) return false;

      const response = await apiService.post<AuthTokens>('/auth/refresh', {
        refresh_token: refreshToken,
      });

      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      apiService.setAccessToken(response.access_token);

      return true;
    } catch {
      await this.logout();
      return false;
    }
  }
}

export const authService = new AuthService();
