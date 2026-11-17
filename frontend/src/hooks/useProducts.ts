// ============================================================
// MAKARIOVS & MATIÈRE — React Query Hooks
// ============================================================
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, ordersApi, authApi, couponsApi, shippingApi } from '@/lib/api';
import type { Product, Order, User, Coupon } from '@/types';

// ── Products ─────────────────────────────────────────────

export function useProducts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params).then((r) => r.data),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.show(slug).then((r) => r.data),
    enabled: Boolean(slug),
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.featured().then((r) => r.data),
  });
}

// ── Shipping ─────────────────────────────────────────────

export function useShippingZones() {
  return useQuery({
    queryKey: ['shippingZones'],
    queryFn: () => shippingApi.zones().then((r) => r.data),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// ── Coupon ───────────────────────────────────────────────

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      couponsApi.validate(code, subtotal).then((r) => r.data as Coupon),
  });
}

// ── Orders ───────────────────────────────────────────────

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => ordersApi.create(data).then((r) => r.data as Order),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useOrder(reference: string) {
  return useQuery({
    queryKey: ['order', reference],
    queryFn: () => ordersApi.show(reference).then((r) => r.data),
    enabled: Boolean(reference),
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => ordersApi.myOrders().then((r) => r.data),
  });
}

// ── Auth ─────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then((r) => r.data as User),
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password).then((r) => r.data as { token: string; user: User }),
    onSuccess: ({ token }) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sanctum_token', token);
      }
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sanctum_token');
      }
      qc.clear();
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) =>
      authApi.register(data).then((r) => r.data as { token: string; user: User }),
    onSuccess: ({ token }) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sanctum_token', token);
      }
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
