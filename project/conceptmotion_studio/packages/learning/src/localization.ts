import type { Locale, LocalizedText } from '@datapass/content';

export type LearningLocale = Locale | (string & {});

export function resolveLearningText(value: LocalizedText, locale: LearningLocale = 'en'): string {
  if (typeof value === 'string') return value;
  const entries = value as Readonly<Record<string, string | undefined>>;
  return entries[locale]?.trim()
    || entries.en?.trim()
    || Object.values(entries).find((candidate) => candidate?.trim())
    || '';
}

export function resolveOptionalLearningText(
  value: LocalizedText | undefined,
  locale: LearningLocale = 'en',
): string | undefined {
  return value === undefined ? undefined : resolveLearningText(value, locale);
}
