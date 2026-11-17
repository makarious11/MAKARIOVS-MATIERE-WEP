// ============================================================
// L'VENUS — UI Store
// ============================================================
import { create } from 'zustand';
import type { Locale } from '@/types';

interface UIState {
  isCartOpen: boolean;
  isMenuOpen: boolean;
  isSearchOpen: boolean;
  locale: Locale;
  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  setLocale: (locale: Locale) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMenuOpen: false,
  isSearchOpen: false,
  locale: 'en',

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),

  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  setLocale: (locale) => set({ locale }),
}));
