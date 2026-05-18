import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './useThemeStore';

// Each test starts from a known baseline: light theme, Turkish language.
// Merge (no replace) so Zustand action functions are preserved.
beforeEach(() => {
  useThemeStore.setState({ theme: 'light', language: 'tr' });
  localStorage.clear();
});

describe('useThemeStore — default state', () => {
  it('initialises with light theme', () => {
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('initialises with Turkish language', () => {
    expect(useThemeStore.getState().language).toBe('tr');
  });
});

describe('useThemeStore — setTheme', () => {
  it('switches to dark when setTheme("dark") is called', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('switches back to light when setTheme("light") is called', () => {
    useThemeStore.setState({ theme: 'dark' });
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
  });
});

describe('useThemeStore — toggleTheme', () => {
  it('toggles from light to dark on first call', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('toggles back to light on second call', () => {
    useThemeStore.getState().toggleTheme();
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('is idempotent across an even number of toggles', () => {
    for (let i = 0; i < 6; i++) useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
  });
});

describe('useThemeStore — setLanguage', () => {
  it('switches language to English', () => {
    useThemeStore.getState().setLanguage('en');
    expect(useThemeStore.getState().language).toBe('en');
  });

  it('switches language back to Turkish', () => {
    useThemeStore.setState({ language: 'en' });
    useThemeStore.getState().setLanguage('tr');
    expect(useThemeStore.getState().language).toBe('tr');
  });
});

describe('useThemeStore — localStorage persistence', () => {
  it('writes persisted state to localStorage under the dpp-theme key', () => {
    useThemeStore.getState().setTheme('dark');
    const raw = localStorage.getItem('dpp-theme');
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw!);
    expect(stored.state.theme).toBe('dark');
  });

  it('persists language changes to localStorage', () => {
    useThemeStore.getState().setLanguage('en');
    const raw = localStorage.getItem('dpp-theme');
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw!);
    expect(stored.state.language).toBe('en');
  });

  it('stores both theme and language together in one entry', () => {
    useThemeStore.getState().setTheme('dark');
    useThemeStore.getState().setLanguage('en');
    const stored = JSON.parse(localStorage.getItem('dpp-theme')!);
    expect(stored.state).toMatchObject({ theme: 'dark', language: 'en' });
  });
});
