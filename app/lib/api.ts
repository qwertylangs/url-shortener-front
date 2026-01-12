// NEXT_PUBLIC_ переменные доступны в браузере (встраиваются при сборке)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface CreateUrlData {
  url: string;
  alias: string;
}

export interface Url {
  id: number;
  alias: string;
  url: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export const api = {
  async login(data: LoginData): Promise<Response> {
    return fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  },

  async register(data: RegisterData): Promise<Response> {
    return fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  },

  async checkAuth(): Promise<Response> {
    return fetch(`${API_URL}/login`, {
      method: 'GET',
      credentials: 'include',
    });
  },

  async createUrl(data: CreateUrlData): Promise<Response> {
    return fetch(`${API_URL}/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  },

  async getUrls(): Promise<{ urls: Url[] }> {
    const response = await fetch(`${API_URL}/url`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch urls');
    }
    
    return response.json();
  },

  async deleteUrl(alias: string): Promise<Response> {
    return fetch(`${API_URL}/url/${alias}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },
};

