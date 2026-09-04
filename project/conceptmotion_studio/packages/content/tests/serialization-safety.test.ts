import { describe, expect, it } from 'vitest';
import {
  isLocalizedText, parseContentCatalog, parseJson, resolveLocalizedText,
  serializeDeterministic, toCanonicalJsonValue, validateFigureSpec, validateRuntimeTarget,
} from '../src';

describe('content serialization and presentation boundary', () => {
  it('distinguishes a shared subtree from a cycle and never serializes unsupported root values', () => {
    const shared = { value: 'safe' };
    expect(toCanonicalJsonValue({ second: shared, first: shared })).toEqual({ first: shared, second: shared });
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => serializeDeterministic(cyclic)).toThrow(/cyclic/);
    for (const value of [undefined, () => 1, Symbol('omitted')]) {
      expect(() => toCanonicalJsonValue(value)).toThrow(/root value/);
    }
    expect(() => toCanonicalJsonValue({ amount: 1n })).toThrow(/BigInt/);
  });

  it('normalizes JSON-compatible optional values without changing array positions', () => {
    expect(serializeDeterministic({ absent: undefined, list: [undefined, NaN, Infinity, false, null], keep: true }, 0))
      .toBe('{"keep":true,"list":[null,null,null,false,null]}');
    expect(() => parseJson('{broken')).toThrow(/Invalid JSON/);
    expect(() => parseContentCatalog('{"version":"future"}')).toThrow(/Invalid ContentCatalog/);
  });

  it('uses explicit locale, then English, then available content, without assuming full translation', () => {
    expect(resolveLocalizedText('Original wording', 'no')).toBe('Original wording');
    expect(resolveLocalizedText({ en: 'English', no: 'Norsk' }, 'no')).toBe('Norsk');
    expect(resolveLocalizedText({ en: 'English', no: ' ' }, 'no')).toBe('English');
    expect(resolveLocalizedText({ no: 'Norsk' }, 'en')).toBe('Norsk');
    expect(resolveLocalizedText({ en: ' ' })).toBe('');
    for (const value of [null, [], {}, { fr: 'Texte' }, { en: 12 }, ' ']) expect(isLocalizedText(value)).toBe(false);
    expect(isLocalizedText({ en: undefined, no: 'Norsk' })).toBe(true);
  });

  it('rejects figure state/metadata and runtime execution-location inconsistencies', () => {
    const figure = validateFigureSpec({
      id: 'figure.invalid', title: 'Invalid', kind: 'concept', rendererId: 'table.transform',
      fallbackText: 'Plain fallback', spec: {}, profile: 'neon', verifiedAt: 'not a date',
      reducedMotionState: {}, staticState: false,
    });
    expect(figure.valid).toBe(false);
    expect(figure.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'content.figure.state.invalid', 'content.figure.profile.invalid', 'content.date.invalid',
    ]));
    expect(validateRuntimeTarget({ id: 'download', label: 'Download', kind: 'download', downloadPath: '/lesson.ipynb', executesExternally: true }).valid).toBe(false);
    expect(validateRuntimeTarget({ id: 'colab', label: 'Colab', kind: 'colab', url: 'https://colab.research.google.com/', executesExternally: false }).valid).toBe(false);
    const insecure = validateRuntimeTarget({ id: 'reference', label: 'Reference', kind: 'external', url: 'http://example.test/', executesExternally: false });
    expect(insecure.valid).toBe(true);
    expect(insecure.issues).toContainEqual(expect.objectContaining({ code: 'content.url.insecure', severity: 'warning' }));
  });
});
