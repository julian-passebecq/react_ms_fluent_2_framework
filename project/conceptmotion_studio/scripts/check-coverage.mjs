import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const METRICS = ['statements', 'branches', 'functions', 'lines'];

// Independent regression floors below the measured V2 baseline; these are not
// targets for UI packages. Re-audit deliberately when semantic source expands.
export const PACKAGE_THRESHOLDS = {
  core: { statements: 75, branches: 70, functions: 88, lines: 82 },
  knowledge: { statements: 80, branches: 70, functions: 90, lines: 88 },
  content: { statements: 75, branches: 65, functions: 85, lines: 82 },
  'notebook-import': { statements: 75, branches: 65, functions: 85, lines: 80 },
  progress: { statements: 72, branches: 62, functions: 90, lines: 85 },
  scaffold: { statements: 95, branches: 85, functions: 95, lines: 95 },
};

/** Aggregate covered/total counters, never an average of file percentages. */
export function summarizePureCoverage(summary, thresholds = PACKAGE_THRESHOLDS) {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
    throw new Error('Coverage summary must be a per-file JSON object.');
  }
  const failures = [];
  const packages = Object.fromEntries(Object.entries(thresholds).map(([name, floors]) => {
    const files = Object.entries(summary).filter(([filename]) => filename.replaceAll('\\', '/').includes(`/packages/${name}/src/`));
    if (files.length === 0) failures.push(`${name}: no instrumented source files; check Vitest coverage.include.`);
    const metrics = Object.fromEntries(METRICS.map((metric) => {
      let total = 0;
      let covered = 0;
      for (const [filename, file] of files) {
        const counter = file?.[metric];
        if (!counter || !Number.isInteger(counter.total) || !Number.isInteger(counter.covered)
          || counter.total < 0 || counter.covered < 0 || counter.covered > counter.total) {
          throw new Error(`Invalid ${metric} coverage counters for ${filename}.`);
        }
        total += counter.total;
        covered += counter.covered;
      }
      // An empty package is not 100% covered. Type-only individual files are
      // retained, but each required package must contain measured runtime code.
      const percent = total === 0 ? 0 : Math.floor(covered / total * 10_000) / 100;
      const threshold = floors[metric];
      if (total === 0) failures.push(`${name}.${metric}: no measured runtime counters.`);
      else if (percent < threshold) failures.push(`${name}.${metric}: ${percent}% is below ${threshold}%.`);
      return [metric, { covered, total, percent, threshold }];
    }));
    return [name, { files: files.length, metrics }];
  }));
  return { schemaVersion: 1, packages, failures, passed: failures.length === 0 };
}

export function formatPureCoverage(report) {
  const lines = [
    '# Pure-package coverage', '',
    'Percentages aggregate covered/total V8 counters per package. Parenthesized numbers are enforced regression floors; zero-runtime or missing packages fail. UI packages are intentionally outside this numeric gate.', '',
    '| Package | Statements | Branches | Functions | Lines |',
    '| --- | --- | --- | --- | --- |',
    ...Object.entries(report.packages).map(([name, value]) => `| ${name} | ${METRICS.map((metric) => {
      const counter = value.metrics[metric];
      return `${counter.percent.toFixed(2)}% (${counter.threshold}%)`;
    }).join(' | ')} |`), '',
    report.passed ? 'Result: PASS.' : `Result: FAIL.\n\n${report.failures.map((failure) => `- ${failure}`).join('\n')}`,
    '',
  ];
  return lines.join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const input = resolve(process.argv[2] ?? 'coverage/coverage-summary.json');
    const report = summarizePureCoverage(JSON.parse(readFileSync(input, 'utf8')));
    const directory = dirname(input);
    mkdirSync(directory, { recursive: true });
    writeFileSync(resolve(directory, 'pure-package-summary.json'), `${JSON.stringify(report, null, 2)}\n`);
    writeFileSync(resolve(directory, 'pure-package-summary.md'), formatPureCoverage(report));
    console.log(formatPureCoverage(report));
    if (!report.passed) process.exitCode = 1;
  } catch (error) {
    console.error(`Pure-package coverage failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
