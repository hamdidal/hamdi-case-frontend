import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { useThemeStore } from '@/store/useThemeStore';

// The icons are SVG components — mock them to avoid SVG rendering quirks.
vi.mock('./icons', () => ({
  IconSun: ({ size }: { size: number }) => <svg data-testid="icon-sun" data-size={size} />,
  IconMoon: ({ size }: { size: number }) => <svg data-testid="icon-moon" data-size={size} />,
}));

beforeEach(() => {
  useThemeStore.setState({ theme: 'light', language: 'tr' });
});

describe('ThemeToggle — light mode', () => {
  it('renders the moon icon when theme is light', () => {
    render(<ThemeToggle />);
    expect(screen.getByTestId('icon-moon')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-sun')).not.toBeInTheDocument();
  });

  it('shows aria-label prompting switch to dark mode', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });
});

describe('ThemeToggle — dark mode', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'dark' });
  });

  it('renders the sun icon when theme is dark', () => {
    render(<ThemeToggle />);
    expect(screen.getByTestId('icon-sun')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-moon')).not.toBeInTheDocument();
  });

  it('shows aria-label prompting switch to light mode', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });
});

describe('ThemeToggle — interaction', () => {
  it('calls toggleTheme when clicked (light → dark)', () => {
    render(<ThemeToggle />);
    expect(useThemeStore.getState().theme).toBe('light');
    fireEvent.click(screen.getByRole('button'));
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('calls toggleTheme when clicked again (dark → light)', () => {
    useThemeStore.setState({ theme: 'dark' });
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(useThemeStore.getState().theme).toBe('light');
  });
});
