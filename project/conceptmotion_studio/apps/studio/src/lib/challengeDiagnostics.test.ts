import { describe, expect, it } from 'vitest';
import { analyzeDraft } from './challengeDiagnostics';

describe('analyzeDraft', () => {
  it('reports a starter placeholder without claiming correctness', () => {
    expect(analyzeDraft('SELECT -- TODO: fields\nFROM source')[0]).toMatchObject({
      severity: 'info',
      code: 'DP100',
      line: 1,
    });
  });

  it('reports unmatched delimiters with a local location', () => {
    expect(analyzeDraft('SELECT (amount\nFROM orders')).toContainEqual(expect.objectContaining({
      severity: 'warning',
      code: 'DP202',
      line: 1,
    }));
  });

  it('returns no diagnostics for a complete balanced draft', () => {
    expect(analyzeDraft('SELECT COALESCE(SUM(amount), 0) FROM orders;')).toEqual([]);
  });
});
