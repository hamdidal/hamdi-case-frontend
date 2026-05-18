import { create } from 'zustand';

interface LoadingState {
  activeRequests: number;
  increment: () => void;
  decrement: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  activeRequests: 0,
  increment: () => set((s) => ({ activeRequests: s.activeRequests + 1 })),
  decrement: () => set((s) => ({ activeRequests: Math.max(0, s.activeRequests - 1) })),
}));
