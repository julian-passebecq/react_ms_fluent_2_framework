import { beforeEach, describe, expect, it } from 'vitest';
import { readLocalValue, writeLocalValue } from './usePersistentState';

describe('local persistence helpers', () => {
  beforeEach(() => window.localStorage.clear());

  it('round-trips structured local state', () => {
    expect(writeLocalValue('test:value', { status: 'mastered' })).toBe(true);
    expect(readLocalValue('test:value', { status: 'new' })).toEqual({ status: 'mastered' });
  });

  it('uses the fallback for invalid storage data', () => {
    window.localStorage.setItem('test:bad', '{');
    expect(readLocalValue('test:bad', 'fallback')).toBe('fallback');
  });
});
