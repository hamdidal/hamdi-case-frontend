import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/store/useThemeStore';
import type { Language } from '@/store/useThemeStore';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const language = useThemeStore((s) => s.language);
  const setLanguage = useThemeStore((s) => s.setLanguage);

  const switchTo = (lang: Language) => {
    setLanguage(lang);
    void i18n.changeLanguage(lang);
  };

  return (
    <div className="seg" title="Language">
      <button
        type="button"
        data-on={language === 'tr'}
        onClick={() => switchTo('tr')}
      >
        TR
      </button>
      <button
        type="button"
        data-on={language === 'en'}
        onClick={() => switchTo('en')}
      >
        EN
      </button>
    </div>
  );
}
