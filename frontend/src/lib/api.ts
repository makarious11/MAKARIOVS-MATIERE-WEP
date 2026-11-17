// ============================================================
// MAKARIOVS & MATIÈRE — API Client (fetch wrapper)
// ============================================================

import { API_URL } from './constants';
import type { ApiResponse } from '@/types';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** Revalidation seconds for Next.js cache (GET only) */
  revalidate?: number;
  /** Pass 'no-store' to skip caching entirely */
  cache?: RequestCache;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers: extraHeaders = {},
    revalidate,
    cache,
  } = options;

  // Build auth header if token exists (client-side)
  const authHeader: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sanctum_token');
    if (token) authHeader['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeader,
      ...extraHeaders,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...(cache ? { cache } : {}),
    ...(revalidate !== undefined
      ? { next: { revalidate } }
      : {}),
  };

  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const error = new Error(
      errorBody?.message ?? `HTTP ${res.status}: ${res.statusText}`,
    ) as Error & { status: number; errors?: unknown };
    error.status = res.status;
    error.errors = errorBody?.errors;
    throw error;
  }

  return res.json() as Promise<ApiResponse<T>>;
}

// ── Convenience helpers ──────────────────────────────────────

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'GET' }),

  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),

  delete: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};

// ── Domain-specific API helpers ──────────────────────────────

export const productsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<import('@/types').Product[]>(`/products${qs}`, { revalidate: 60 });
  },
  show: (slug: string) =>
    api.get<import('@/types').Product>(`/products/${slug}`, { revalidate: 60 }),
  featured: () =>
    api.get<import('@/types').Product[]>('/products?is_featured=1', { revalidate: 120 }),
};

export const ordersApi = {
  create: (data: unknown) => api.post<import('@/types').Order>('/orders', data),
  show: (reference: string) =>
    api.get<import('@/types').Order>(`/orders/${reference}`, { cache: 'no-store' }),
  myOrders: () =>
    api.get<import('@/types').Order[]>('/user/orders', { cache: 'no-store' }),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: import('@/types').User }>('/auth/login', {
      email,
      password,
    }),
  register: (data: unknown) =>
    api.post<{ token: string; user: import('@/types').User }>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<import('@/types').User>('/auth/me', { cache: 'no-store' }),
};

export const couponsApi = {
  validate: (code: string, subtotal: number) =>
    api.post<import('@/types').Coupon>('/coupons/validate', { code, subtotal }),
};

export const shippingApi = {
  zones: () =>
    api.get<import('@/types').ShippingZone[]>('/shipping-zones', { revalidate: 3600 }),
};
