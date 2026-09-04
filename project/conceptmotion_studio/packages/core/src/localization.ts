export const SUPPORTED_LOCALES = ['en', 'no'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type LocalizedText = string | Partial<Record<Locale, string>>;

export function isLocalizedText(value: unknown): value is LocalizedText {
  if (typeof value === 'string') return value.trim().length > 0;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return entries.some(([, text]) => typeof text === 'string' && text.trim().length > 0) && entries.every(
    ([locale, text]) => SUPPORTED_LOCALES.includes(locale as Locale) && (text === undefined || typeof text === 'string')
  );
}

/** requested locale -> English -> first non-empty supported value -> empty string */
export function resolveLocalizedText(value: LocalizedText | null | undefined, locale: Locale = 'en'): string {
  if (typeof value === 'string') return value.trim().length > 0 ? value : '';
  if (!value) return '';
  const requested = value[locale];
  if (typeof requested === 'string' && requested.trim().length > 0) return requested;
  const english = value.en;
  if (typeof english === 'string' && english.trim().length > 0) return english;
  for (const supportedLocale of SUPPORTED_LOCALES) {
    const candidate = value[supportedLocale];
    if (typeof candidate === 'string' && candidate.trim().length > 0) return candidate;
  }
  return '';
}
