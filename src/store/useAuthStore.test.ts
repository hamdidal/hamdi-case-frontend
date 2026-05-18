import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';
import type { User } from '@/types';

const mockUser: User = {
  id: 'user-uuid-001',
  username: 'testadmin',
  role: 'admin',
  createdAt: '2025-01-01T00:00:00Z',
};

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null, isAuthenticated: false, remember: true });
  localStorage.clear();
  sessionStorage.clear();
});

describe('useAuthStore — initial state', () => {
  it('has null token on init', () => {
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('has null user on init', () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('is not authenticated on init', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('defaults remember to true', () => {
    expect(useAuthStore.getState().remember).toBe(true);
  });
});

describe('useAuthStore — setAuth', () => {
  it('stores token and user and marks authenticated', () => {
    useAuthStore.getState().setAuth(mockToken, mockUser);
    const state = useAuthStore.getState();
    expect(state.token).toBe(mockToken);
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('sets remember=true by default', () => {
    useAuthStore.getState().setAuth(mockToken, mockUser);
    expect(useAuthStore.getState().remember).toBe(true);
  });

  it('honours explicit remember=false flag', () => {
    useAuthStore.getState().setAuth(mockToken, mockUser, false);
    expect(useAuthStore.getState().remember).toBe(false);
  });
});

describe('useAuthStore — clearAuth', () => {
  it('clears all auth state', () => {
    useAuthStore.getState().setAuth(mockToken, mockUser);
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('resets remember to true after clearAuth', () => {
    useAuthStore.getState().setAuth(mockToken, mockUser, false);
    useAuthStore.getState().clearAuth();
    expect(useAuthStore.getState().remember).toBe(true);
  });
});

describe('useAuthStore — switchable storage (remember flag)', () => {
  it('persists to localStorage when remember=true', () => {
    useAuthStore.getState().setAuth(mockToken, mockUser, true);
    // Allow persist middleware to flush.
    const stored = localStorage.getItem('dpp-auth');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.token).toBe(mockToken);
    expect(parsed.state.isAuthenticated).toBe(true);
  });

  it('persists to sessionStorage when remember=false', () => {
    useAuthStore.getState().setAuth(mockToken, mockUser, false);
    const stored = sessionStorage.getItem('dpp-auth');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.token).toBe(mockToken);
    // localStorage must NOT contain the key when remember=false.
    expect(localStorage.getItem('dpp-auth')).toBeNull();
  });

  it('does not write to sessionStorage when remember=true', () => {
    useAuthStore.getState().setAuth(mockToken, mockUser, true);
    expect(sessionStorage.getItem('dpp-auth')).toBeNull();
  });
});
