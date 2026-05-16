import i18n from '@/i18n';

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
