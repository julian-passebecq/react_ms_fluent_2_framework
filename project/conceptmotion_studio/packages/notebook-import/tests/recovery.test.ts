import { describe, expect, it } from 'vitest';
import { importIpynb } from '../src';

const notebook = (cells: unknown[], extras: Record<string, unknown> = {}) => JSON.stringify({ cells, metadata: {}, nbformat: 4, ...extras });
const code = (outputs: unknown[]) => ({ id: 'code', cell_type: 'code', source: 'display(saved)', outputs });

describe('notebook import fidelity and malformed-output recovery', () => {
  it('disambiguates duplicate source identities deterministically without discarding cells', () => {
    const source = notebook([
      { id: 'same', cell_type: 'markdown', source: '# Lesson\r\nOne' },
      { id: 'same', cell_type: 'markdown', source: 'Two' },
      { cell_type: 'markdown', source: 'Unidentified' },
    ]);
    const first = importIpynb(source, { sourceFile: 'lesson.ipynb' });
    expect(first).toEqual(importIpynb(source, { sourceFile: 'lesson.ipynb' }));
    expect(first.ok).toBe(true);
    expect(first.notebook?.title).toBe('Lesson');
    expect(first.notebook?.cells[1].id).toBe(`${first.notebook?.cells[0].id}.2`);
    expect(first.issues).toContainEqual(expect.objectContaining({ code: 'notebook.cell.id.duplicate', severity: 'warning' }));
  });

  it('retains saved stderr and error output as reference data, never a runtime failure', () => {
    const result = importIpynb(notebook([code([
      { output_type: 'stream', name: 'stderr', text: ['saved warning\n'] },
      { output_type: 'error', ename: 'ValueError', evalue: 'saved failure' },
      { output_type: 'error', traceback: ['Traceback\n', 'saved stack'] },
    ])]), { sourceFile: 'saved-errors.ipynb' });
    expect(result.ok).toBe(true);
    expect(result.notebook?.cells.slice(1)).toEqual([
      expect.objectContaining({ source: 'reference', isError: true, text: 'saved warning\n' }),
      expect.objectContaining({ source: 'reference', isError: true, text: 'ValueError: saved failure' }),
      expect.objectContaining({ source: 'reference', isError: true, text: 'Traceback\nsaved stack' }),
    ]);
  });

  it.each([
    [null, 'notebook.output.object'],
    [{ output_type: 'stream', text: 42 }, 'notebook.output.stream.invalid'],
    [{ output_type: 'display_data', data: [] }, 'notebook.output.data.invalid'],
  ])('rejects malformed saved output with a stable path: %j', (output, issue) => {
    const result = importIpynb(notebook([code([output])]), { sourceFile: 'malformed-output.ipynb' });
    expect(result.ok).toBe(false);
    expect(result.notebook).toBeUndefined();
    expect(result.issues).toContainEqual(expect.objectContaining({ code: issue, path: 'cells[0].outputs[0]', severity: 'error' }));
  });

  it('imports record and matrix tables while retaining unsupported tabular data as inert Markdown fallback', () => {
    const result = importIpynb(notebook([code([
      { output_type: 'display_data', data: { 'application/json': [{ z: 2, a: true }, { z: 3, a: null }] } },
      { output_type: 'display_data', data: { 'application/json': { columns: ['name', 'nested'], data: [['A', { x: 1 }]] } } },
      { output_type: 'display_data', data: { 'application/json': 42, 'text/markdown': '**Saved reference**' } },
      { output_type: 'custom-widget' },
    ])]), { sourceFile: 'tables.ipynb' });
    expect(result.ok).toBe(true);
    expect(result.notebook?.cells[1]).toMatchObject({ type: 'table-output', columns: ['a', 'z'], rows: [[true, 2], [null, 3]] });
    expect(result.notebook?.cells[2]).toMatchObject({ type: 'table-output', columns: ['name', 'nested'], rows: [['A', '{"x":1}']] });
    expect(result.notebook?.cells[3]).toMatchObject({ type: 'text-output', format: 'markdown', source: 'reference' });
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(['notebook.output.table.invalid', 'notebook.output.type.unsupported']));
  });

  it('reports invalid metadata/options and unresolved assets without silently inventing content', () => {
    const invalid = importIpynb(notebook([null], { metadata: [], nbformat_minor: -1 }), {
      sourceFile: ' ', importedAt: 'invalid', license: { id: 'CC-BY', requiresAttribution: true },
    });
    expect(invalid.ok).toBe(false);
    expect(invalid.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'notebook.source-file.required', 'notebook.imported-at.invalid', 'notebook.metadata.invalid',
      'notebook.format-minor.invalid', 'notebook.license.attribution.required', 'notebook.cell.object',
    ]));
    const missing = importIpynb(notebook([{
      cell_type: 'markdown', source: '![Missing](../outside.png) ![Vector](local.svg)',
      attachments: { broken: null, vector: { 'image/svg+xml': '<svg />' } },
    }]), { sourceFile: 'assets.ipynb', localMedia: [{ sourcePath: 'local.svg', mimeType: 'image/svg+xml', contentBase64: 'PHN2ZyAvPg==' }] });
    expect(missing.ok).toBe(true);
    expect(missing.media).toEqual([]);
    expect(missing.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'notebook.attachment.invalid', 'notebook.mime.unsupported', 'notebook.media.local.unresolved',
    ]));
  });
});
