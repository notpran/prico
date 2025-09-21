import { apiClient } from './client';

export interface User {
  _id: string;
  email: string;
  username: string;
  displayName: string;
  age: number;
  emailVerified: boolean;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignupData {
  email: string;
  username: string;
  displayName: string;
  age: number;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  async signup(data: SignupData): Promise<{ message: string }> {
    return apiClient.post('/auth/signup', data);
  },

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiClient.get(`/auth/verify?token=${token}`);
  },

  getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
};