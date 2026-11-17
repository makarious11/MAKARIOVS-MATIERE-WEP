import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  isMounted: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  isMounted: false,
  setTheme: (theme: Theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lv_theme', theme);
        document.cookie = `lv_theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (err) {
        console.error('Theme storage error:', err);
      }
    }
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(nextTheme);
  },
  initTheme: () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('lv_theme') as Theme | null;
        let selectedTheme: Theme = 'light';
        if (stored === 'dark' || stored === 'light') {
          selectedTheme = stored;
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          selectedTheme = 'dark';
        }
        set({ theme: selectedTheme, isMounted: true });
        if (selectedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch {
        set({ theme: 'light', isMounted: true });
      }
    }
  },
}));

