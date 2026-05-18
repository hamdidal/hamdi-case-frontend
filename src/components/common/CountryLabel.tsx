import { useTranslation } from 'react-i18next';
import { getCountryByCode } from '@/utils/countries';

interface Props {
  code: string;
  showName?: boolean;
  className?: string;
}

export function CountryLabel({ code, showName = true, className }: Props) {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('tr') ? 'tr' : 'en';
  const country = getCountryByCode(code, lang);

  if (!country) {
    return <span className={className}>{code || '—'}</span>;
  }

  return (
    <span className={`country-label${className ? ` ${className}` : ''}`}>
      <span className="country-flag" aria-hidden="true">{country.flag}</span>
      {showName && <span>{country.name}</span>}
    </span>
  );
}
