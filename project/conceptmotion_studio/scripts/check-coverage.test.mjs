import { describe, expect, it } from 'vitest';
import { formatPureCoverage, METRICS, summarizePureCoverage } from './check-coverage.mjs';

const floors = { example: Object.fromEntries(METRICS.map((metric) => [metric, 50])) };
const counters = (covered, total) => Object.fromEntries(METRICS.map((metric) => [metric, { covered, total, pct: 100 }]));

describe('pure-package coverage accounting', () => {
  it('weights raw counters and supports Linux and Windows report paths', () => {
    const report = summarizePureCoverage({
      '/repo/packages/example/src/small.ts': counters(1, 1),
      'D:\\repo\\packages\\example\\src\\large.ts': counters(49, 99),
      total: counters(999, 999),
    }, floors);
    expect(report.passed).toBe(true);
    expect(report.packages.example.metrics.lines).toEqual({ covered: 50, total: 100, percent: 50, threshold: 50 });
    expect(formatPureCoverage(report)).toContain('50.00% (50%)');
  });

  it('fails absent packages, empty runtime packages and below-floor results', () => {
    expect(summarizePureCoverage({}, floors).passed).toBe(false);
    expect(summarizePureCoverage({ '/repo/packages/example/src/types.ts': counters(0, 0) }, floors).failures)
      .toContain('example.lines: no measured runtime counters.');
    const low = summarizePureCoverage({ '/repo/packages/example/src/runtime.ts': counters(49, 100) }, floors);
    expect(low.failures).toContain('example.lines: 49% is below 50%.');
    expect(formatPureCoverage(low)).toContain('Result: FAIL.');
  });

  it('rejects malformed counters instead of accidentally passing NaN comparisons', () => {
    for (const values of [counters(2, 1), counters(-1, 1), counters(1, NaN), {}]) {
      expect(() => summarizePureCoverage({ '/repo/packages/example/src/bad.ts': values }, floors)).toThrow(/Invalid/);
    }
    expect(() => summarizePureCoverage(null, floors)).toThrow(/JSON object/);
  });
});
