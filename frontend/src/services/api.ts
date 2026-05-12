import axios, { AxiosError } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Types ──────────────────────────────────────────────────────────────────
export interface UrlData {
  _id: string;
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  shortUrl: string;
  title?: string;
  clicks: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AnalyticsData {
  totalClicks: number;
  uniqueClicks: number;
  clicksByDay: { date: string; count: number }[];
  clicksByDevice: { device: string; count: number }[];
  clicksByBrowser: { browser: string; count: number }[];
  topReferers: { referer: string; count: number }[];
}

// ── Auth API ───────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  me: () => apiClient.get('/auth/me'),
};

// ── URL API ────────────────────────────────────────────────────────────────
export const urlApi = {
  create: (data: { originalUrl: string; customAlias?: string; title?: string; expiresAt?: string }) =>
    apiClient.post<{ success: boolean; data: UrlData }>('/urls', data),
  list: (page = 1, limit = 10) =>
    apiClient.get<{ success: boolean; data: UrlData[]; pagination: PaginationMeta }>(
      `/urls?page=${page}&limit=${limit}`
    ),
  getByCode: (code: string) =>
    apiClient.get<{ success: boolean; data: UrlData }>(`/urls/${code}`),
  update: (code: string, data: { title?: string; isActive?: boolean }) =>
    apiClient.put<{ success: boolean; data: UrlData }>(`/urls/${code}`, data),
  delete: (code: string) =>
    apiClient.delete(`/urls/${code}`),
  analytics: (code: string) =>
    apiClient.get<{ success: boolean; data: AnalyticsData }>(`/urls/${code}/analytics`),
};
