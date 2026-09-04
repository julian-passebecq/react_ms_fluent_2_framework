import { describe, expect, it } from 'vitest';
import {
  normalizeLocale,
  readStoredLocale,
  resolveLocalizedText,
  writeStoredLocale,
} from '../src/locale-helpers';
import type { LocaleStorage } from '../src/locale-helpers';

function memoryStorage(initial: Record<string, string> = {}): LocaleStorage & { values: Map<string, string> } {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

describe('resolveLocalizedText', () => {
  it('preserves a legacy plain string', () => {
    expect(resolveLocalizedText('Stable identifier', 'no')).toBe('Stable identifier');
  });

  it('returns the requested locale when available', () => {
    expect(resolveLocalizedText({ en: 'Source', no: 'Kilde' }, 'no')).toBe('Kilde');
  });

  it('falls back to English before another translation', () => {
    expect(resolveLocalizedText({ en: 'Source' }, 'no')).toBe('Source');
  });

  it('uses the first available translation and then an empty string', () => {
    expect(resolveLocalizedText({ no: 'Bare norsk' }, 'en')).toBe('Bare norsk');
    expect(resolveLocalizedText({}, 'no')).toBe('');
    expect(resolveLocalizedText(undefined, 'en')).toBe('');
  });
});

describe('locale persistence helpers', () => {
  it('normalizes unsupported locale values', () => {
    expect(normalizeLocale('nb')).toBe('en');
    expect(normalizeLocale('nb', 'no')).toBe('no');
  });

  it('round-trips an EN/NO locale', () => {
    const storage = memoryStorage();
    expect(writeStoredLocale(storage, 'no')).toBe(true);
    expect(readStoredLocale(storage)).toBe('no');
  });

  it('uses the fallback for invalid or unavailable storage', () => {
    const invalid = memoryStorage({ 'datapass:locale': 'de' });
    expect(readStoredLocale(invalid, 'datapass:locale', 'no')).toBe('no');
    expect(readStoredLocale(null, 'datapass:locale', 'en')).toBe('en');
  });

  it('does not throw when storage is blocked', () => {
    const blocked: LocaleStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readStoredLocale(blocked, 'datapass:locale', 'no')).toBe('no');
    expect(writeStoredLocale(blocked, 'en')).toBe(false);
  });
});
