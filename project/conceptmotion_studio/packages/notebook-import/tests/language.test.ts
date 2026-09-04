import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { detectCodeCellLanguage, detectNotebookLanguage, importIpynb } from '../src';

describe('notebook code language detection', () => {
  it('uses explicit per-cell language metadata and tags first', () => {
    expect(detectCodeCellLanguage('print(1)', { language: 'SQL' }, 'python')).toBe('sql');
    expect(detectCodeCellLanguage('print(1)', { vscode: { languageId: 'python' } }, 'sql')).toBe('python');
    expect(detectCodeCellLanguage('print(1)', { tags: ['example', 'lang:pyspark'] }, 'python')).toBe('pyspark');
  });

  it('recognizes conservative SQL-leading statements but not a Python with statement', () => {
    expect(detectCodeCellLanguage('-- exercise\nSELECT id FROM products', {}, 'python')).toBe('sql');
    expect(detectCodeCellLanguage('WITH totals AS (SELECT amount FROM orders) SELECT * FROM totals', {}, 'python')).toBe('sql');
    expect(detectCodeCellLanguage('with open("file.txt") as handle:\n    print(handle.read())', {}, 'python')).toBe('python');
  });

  it('recognizes PySpark kernels and imports before SQL-like method names', () => {
    const metadata = { kernelspec: { name: 'pyspark', display_name: 'PySpark', language: 'python' }, language_info: { name: 'python' } };
    expect(detectNotebookLanguage(metadata)).toBe('pyspark');
    expect(detectCodeCellLanguage('from pyspark.sql import functions as F\norders.select("id")', {}, 'python')).toBe('pyspark');
  });

  it('labels the representative SQL exercise cell as SQL inside its Python-kernel notebook', () => {
    const path = resolve(process.cwd(), 'examples/notebooks/dubreu_sql_where_reference.ipynb');
    const result = importIpynb(readFileSync(path, 'utf8'), { sourceFile: 'dubreu_sql_where_reference.ipynb' });
    expect(result.ok).toBe(true);
    const exercise = result.notebook?.cells.find((cell) => cell.sourceCellId === 'where-exercise');
    expect(exercise).toMatchObject({ type: 'code', language: 'sql' });
  });
});
