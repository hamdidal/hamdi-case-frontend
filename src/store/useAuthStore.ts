import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  remember: boolean;
  setAuth: (token: string, user: User, remember?: boolean) => void;
  clearAuth: () => void;
}

const switchableStorage = {
  getItem: (name: string) => {
    return localStorage.getItem(name) ?? sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    try {
      const parsed = JSON.parse(value) as { state?: { remember?: boolean } };
      const useLocal = parsed?.state?.remember ?? true;
      if (useLocal) {
        sessionStorage.removeItem(name);
        localStorage.setItem(name, value);
      } else {
        localStorage.removeItem(name);
        sessionStorage.setItem(name, value);
      }
    } catch {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      remember: true,
      setAuth: (token, user, remember = true) => set({ token, user, isAuthenticated: true, remember }),
      clearAuth: () => set({ token: null, user: null, isAuthenticated: false, remember: true }),
    }),
    {
      name: 'dpp-auth',
      storage: createJSONStorage(() => switchableStorage),
    },
  ),
);
