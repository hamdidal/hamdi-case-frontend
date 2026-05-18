import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import trLocale from 'i18n-iso-countries/langs/tr.json';

countries.registerLocale(enLocale);
countries.registerLocale(trLocale);

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export function codeToFlag(code: string): string {
  if (!code || code.length !== 2) return '';
  const pts = code.toUpperCase().split('').map((ch) => 0x1f1e6 - 65 + ch.charCodeAt(0));
  return String.fromCodePoint(...pts);
}

export function getCountryList(lang: 'en' | 'tr' = 'en'): CountryOption[] {
  const names = countries.getNames(lang, { select: 'official' });
  return Object.entries(names)
    .map(([code, name]) => ({ code, name, flag: codeToFlag(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, lang));
}

export function getCountryByCode(code: string, lang: 'en' | 'tr' = 'en'): CountryOption | null {
  if (!code) return null;
  const name = countries.getName(code.toUpperCase(), lang);
  if (!name) return null;
  return { code: code.toUpperCase(), name, flag: codeToFlag(code) };
}

export function resolveCountryCode(input: string, lang: 'en' | 'tr' = 'en'): string | null {
  if (!input) return null;
  const upper = input.toUpperCase();
  if (input.length === 2 && countries.isValid(upper)) return upper;
  for (const l of [lang, 'en', 'tr'] as const) {
    const code = countries.getAlpha2Code(input, l);
    if (code) return code;
  }
  return null;
}

export function codeToName(code: string, lang: 'en' | 'tr' = 'en'): string {
  const c = getCountryByCode(code, lang);
  return c?.name ?? code;
}
