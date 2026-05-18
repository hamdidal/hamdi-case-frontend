import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useThemeStore } from '@/store/useThemeStore';

// i18n mock — provides a stable changeLanguage spy without triggering real
// language loading logic.
const mockChangeLanguage = vi.fn().mockResolvedValue(undefined);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: mockChangeLanguage, language: 'tr' },
  }),
}));

beforeEach(() => {
  useThemeStore.setState({ theme: 'light', language: 'tr' });
  mockChangeLanguage.mockClear();
  localStorage.clear();
});

describe('LanguageSwitcher — rendering', () => {
  it('renders a TR button and an EN button', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button', { name: 'TR' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });
});

describe('LanguageSwitcher — active state attributes', () => {
  it('marks TR as active (data-on=true) when language is tr', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button', { name: 'TR' })).toHaveAttribute('data-on', 'true');
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('data-on', 'false');
  });

  it('marks EN as active when language is en', () => {
    useThemeStore.setState({ language: 'en' });
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('data-on', 'true');
    expect(screen.getByRole('button', { name: 'TR' })).toHaveAttribute('data-on', 'false');
  });
});

describe('LanguageSwitcher — switching language', () => {
  it('clicking EN updates the Zustand store to en', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(useThemeStore.getState().language).toBe('en');
  });

  it('clicking EN calls i18n.changeLanguage with "en"', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('clicking TR updates the Zustand store back to tr', () => {
    useThemeStore.setState({ language: 'en' });
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: 'TR' }));
    expect(useThemeStore.getState().language).toBe('tr');
  });

  it('clicking TR calls i18n.changeLanguage with "tr"', () => {
    useThemeStore.setState({ language: 'en' });
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: 'TR' }));
    expect(mockChangeLanguage).toHaveBeenCalledWith('tr');
  });

  it('switching language persists to localStorage via dpp-theme key', () => {
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    const stored = JSON.parse(localStorage.getItem('dpp-theme') ?? '{}');
    expect(stored.state?.language).toBe('en');
  });
});
