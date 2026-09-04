export const SUPPORTED_LOCALES = ['en', 'no'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type LocalizedText = string | Partial<Record<Locale, string>>;

export function isLocalizedText(value: unknown): value is LocalizedText {
  if (typeof value === 'string') return value.trim().length > 0;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  return keys.length > 0
    && keys.every((key) => SUPPORTED_LOCALES.includes(key as Locale))
    && keys.some((key) => typeof record[key] === 'string' && Boolean((record[key] as string).trim()))
    && keys.every((key) => record[key] === undefined || typeof record[key] === 'string');
}

export function resolveLocalizedText(value: LocalizedText, locale: Locale = 'en'): string {
  if (typeof value === 'string') return value;
  const preferred = value[locale]?.trim();
  if (preferred) return preferred;
  const english = value.en?.trim();
  if (english) return english;
  for (const candidate of Object.values(value)) {
    if (candidate?.trim()) return candidate;
  }
  return '';
}
