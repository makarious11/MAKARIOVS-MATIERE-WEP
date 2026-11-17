// ============================================================
// L'VENUS — Zustand Cart Store
// ============================================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Coupon, Product, ProductVariant } from '@/types';

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  // Derived
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  // Actions
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: number) => void;
  updateQty: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
}

function computeSubtotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);
}

function computeDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  if (coupon.type === 'percent') return (subtotal * coupon.value) / 100;
  return Math.min(coupon.value, subtotal);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      total: 0,

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.variant.id === variant.id);
          let items: CartItem[];

          if (existing) {
            items = state.items.map((i) =>
              i.variant.id === variant.id
                ? { ...i, quantity: Math.min(i.quantity + quantity, variant.stock) }
                : i,
            );
          } else {
            items = [
              ...state.items,
              { product, variant, quantity: Math.min(quantity, variant.stock) },
            ];
          }

          const subtotal = computeSubtotal(items);
          const discount = computeDiscount(subtotal, state.coupon);

          return {
            items,
            itemCount: items.reduce((s, i) => s + i.quantity, 0),
            subtotal,
            discount,
            total: subtotal - discount,
          };
        });
      },

      removeItem: (variantId) => {
        set((state) => {
          const items = state.items.filter((i) => i.variant.id !== variantId);
          const subtotal = computeSubtotal(items);
          const discount = computeDiscount(subtotal, state.coupon);
          return {
            items,
            itemCount: items.reduce((s, i) => s + i.quantity, 0),
            subtotal,
            discount,
            total: subtotal - discount,
          };
        });
      },

      updateQty: (variantId, quantity) => {
        if (quantity < 1) {
          get().removeItem(variantId);
          return;
        }
        set((state) => {
          const items = state.items.map((i) =>
            i.variant.id === variantId
              ? { ...i, quantity: Math.min(quantity, i.variant.stock) }
              : i,
          );
          const subtotal = computeSubtotal(items);
          const discount = computeDiscount(subtotal, state.coupon);
          return {
            items,
            itemCount: items.reduce((s, i) => s + i.quantity, 0),
            subtotal,
            discount,
            total: subtotal - discount,
          };
        });
      },

      clearCart: () =>
        set({ items: [], coupon: null, itemCount: 0, subtotal: 0, discount: 0, total: 0 }),

      applyCoupon: (coupon) => {
        set((state) => {
          const discount = computeDiscount(state.subtotal, coupon);
          return { coupon, discount, total: state.subtotal - discount };
        });
      },

      removeCoupon: () => {
        set((state) => ({
          coupon: null,
          discount: 0,
          total: state.subtotal,
        }));
      },
    }),
    {
      name: 'lv_cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist items + coupon; recompute derived fields on hydration
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const subtotal = computeSubtotal(state.items);
        const discount = computeDiscount(subtotal, state.coupon);
        state.itemCount = state.items.reduce((s, i) => s + i.quantity, 0);
        state.subtotal = subtotal;
        state.discount = discount;
        state.total = subtotal - discount;
      },
    },
  ),
);
