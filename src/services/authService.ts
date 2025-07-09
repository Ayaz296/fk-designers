import { apiClient } from '../config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  date_of_birth?: string;
  address_1?: string;
  address_2?: string;
}

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'customer' | 'staff' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  date_of_birth?: string;
  address_1?: string;
  address_2?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', userData);
  },

  async logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout');
  },

  async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  },

  async getAllCustomers(): Promise<User[]> {
    return apiClient.get<User[]>('/users/customers');
  }
};