import { useThemeStore } from '@/store/useThemeStore';
import { IconSun, IconMoon } from './icons';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <span
      className="header-action"
      role="button"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
    >
      {theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
    </span>
  );
}
