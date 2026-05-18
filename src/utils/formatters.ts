import i18n from '@/i18n';

export function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function getActiveLocale(): string {
  return i18n.language === 'tr' ? 'tr-TR' : 'en-US';
}

export function getMonthAbbr(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale ?? getActiveLocale(), { month: 'short' }).format(date);
}

export interface MonthBucket {
  name: string;
  year: number;
  month: number;
}

export function getLast6Months(locale?: string): MonthBucket[] {
  const now = new Date();
  const loc = locale ?? getActiveLocale();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { name: getMonthAbbr(d, loc), year: d.getFullYear(), month: d.getMonth() };
  });
}

export function formatAuditKey(key: string, t: (k: string) => string): string {
  return key.split('.').map((part) => {
    const arrMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrMatch) {
      const raw = t(`audit.fields.${arrMatch[1]}`);
      const label = raw.includes('audit.fields.') ? capitalize(arrMatch[1]) : raw;
      return `${label} → Item ${parseInt(arrMatch[2], 10) + 1}`;
    }
    const raw = t(`audit.fields.${part}`);
    return raw.includes('audit.fields.') ? capitalize(part) : raw;
  }).join(' → ');
}
