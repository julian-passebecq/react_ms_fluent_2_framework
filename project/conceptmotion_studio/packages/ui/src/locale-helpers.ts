export const supportedLocales = ['en', 'no'] as const;

export type Locale = (typeof supportedLocales)[number];
export type LocalizedText = string | Partial<Record<Locale, string>>;

export interface LocaleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const DEFAULT_LOCALE_STORAGE_KEY = 'datapass:locale';

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'no';
}

export function normalizeLocale(value: unknown, fallback: Locale = 'en'): Locale {
  return isLocale(value) ? value : fallback;
}

/**
 * Resolve localized prose without changing legacy plain strings.
 * Fallback order: requested locale, English, first non-empty translation, empty string.
 */
export function resolveLocalizedText(value: LocalizedText | null | undefined, locale: Locale): string {
  if (typeof value === 'string') return value;
  if (!value) return '';

  const requested = value[locale];
  if (typeof requested === 'string' && requested.length > 0) return requested;

  const english = value.en;
  if (typeof english === 'string' && english.length > 0) return english;

  return Object.values(value).find((candidate) => typeof candidate === 'string' && candidate.length > 0) ?? '';
}

export function readStoredLocale(
  storage: LocaleStorage | null | undefined,
  key = DEFAULT_LOCALE_STORAGE_KEY,
  fallback: Locale = 'en',
): Locale {
  if (!storage) return fallback;
  try {
    return normalizeLocale(storage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}

export function writeStoredLocale(
  storage: LocaleStorage | null | undefined,
  locale: Locale,
  key = DEFAULT_LOCALE_STORAGE_KEY,
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(key, locale);
    return true;
  } catch {
    return false;
  }
}

export const commonUiStrings = {
  catalog: { en: 'Catalog', no: 'Katalog' },
  workbench: { en: 'Workbench', no: 'Arbeidsflate' },
  description: { en: 'Description', no: 'Beskrivelse' },
  visualize: { en: 'Visualize', no: 'Visualiser' },
  hints: { en: 'Hints', no: 'Hint' },
  solution: { en: 'Solution', no: 'Løsning' },
  compare: { en: 'Compare', no: 'Sammenlign' },
  search: { en: 'Search', no: 'Søk' },
  source: { en: 'Source', no: 'Kilde' },
  sources: { en: 'Sources', no: 'Kilder' },
  play: { en: 'Play', no: 'Spill av' },
  pause: { en: 'Pause', no: 'Pause' },
  previous: { en: 'Previous', no: 'Forrige' },
  next: { en: 'Next', no: 'Neste' },
  reset: { en: 'Reset', no: 'Tilbakestill' },
  copy: { en: 'Copy', no: 'Kopier' },
  inspector: { en: 'Inspector', no: 'Detaljer' },
  language: { en: 'Language', no: 'Språk' },
  onThisPage: { en: 'On this page', no: 'På denne siden' },
  documentation: { en: 'Documentation', no: 'Dokumentasjon' },
  verified: { en: 'Verified', no: 'Verifisert' },
  diagnostics: { en: 'Diagnostics', no: 'Diagnostikk' },
} as const satisfies Record<string, Partial<Record<Locale, string>>>;

export type CommonUiStringKey = keyof typeof commonUiStrings;
