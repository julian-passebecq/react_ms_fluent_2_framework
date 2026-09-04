import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { serializeDeterministic, validateNotebookSpec } from '@datapass/content';
import { importIpynb } from '../src';

function notebook(cells: unknown[], metadata: Record<string, unknown> = {}): string {
  return JSON.stringify({ cells, metadata, nbformat: 4, nbformat_minor: 5 });
}

describe('importIpynb', () => {
  it('imports deterministic Markdown, code and reference outputs without execution', () => {
    const source = notebook([
      { id: 'intro', cell_type: 'markdown', metadata: {}, source: ['# SQL filtering\n', 'Keep matching rows.'] },
      {
        id: 'query', cell_type: 'code', metadata: { tags: ['example'] }, execution_count: 7, source: 'SELECT 1;', outputs: [
          { output_type: 'stream', name: 'stdout', text: ['one\n'] },
          { output_type: 'execute_result', execution_count: 7, metadata: {}, data: { 'text/plain': ['1'] } },
        ],
      },
    ], { language_info: { name: 'sql' }, title: 'Filtering' });
    const options = { sourceFile: 'course/filter.ipynb', sourceId: 'source.course' } as const;
    const first = importIpynb(source, options);
    const second = importIpynb(source, options);
    expect(first).toEqual(second);
    expect(first.ok).toBe(true);
    expect(first.notebook?.provenance.sourceSha256).toBe(createHash('sha256').update(source).digest('hex'));
    expect(first.notebook?.cells.map((cell) => cell.id)).toEqual(second.notebook?.cells.map((cell) => cell.id));
    expect(first.notebook?.cells[1]).toMatchObject({ type: 'code', execution: 'none', language: 'sql', referenceOutputIds: expect.any(Array) });
    expect(first.notebook?.cells.slice(2).every((cell) => cell.type === 'text-output' && cell.source === 'reference')).toBe(true);
    expect(validateNotebookSpec(first.notebook).valid).toBe(true);
    expect(serializeDeterministic(first.notebook)).toBe(serializeDeterministic(second.notebook));
  });

  it('extracts Deepnote SQL conservatively and preserves its original wrapper provenance', () => {
    const wrapper = `_dntk.execute_sql(
      """SELECT *
      FROM 'fixtures/orders.csv'
      WHERE amount > ____""",
      'SQL_DEEPNOTE_DATAFRAME_SQL'
    )`;
    const result = importIpynb(notebook([{ id: 'deepnote', cell_type: 'code', metadata: {}, source: wrapper, outputs: [] }]), { sourceFile: 'advanced.ipynb' });
    expect(result.ok).toBe(true);
    expect(result.notebook?.cells[0]).toMatchObject({
      type: 'code', language: 'sql', source: expect.stringContaining('amount > ____'),
      provenance: { originalSource: wrapper, transformation: 'deepnote-sql', resourcePaths: ['fixtures/orders.csv'] },
    });
  });

  it('retains an ambiguous Deepnote wrapper and emits a warning', () => {
    const wrapper = `_dntk.execute_sql('SELECT ' + field, 'connection')`;
    const result = importIpynb(notebook([{ id: 'ambiguous', cell_type: 'code', metadata: {}, source: wrapper, outputs: [] }]), { sourceFile: 'fallback.ipynb' });
    expect(result.ok).toBe(true);
    expect(result.notebook?.cells[0]).toMatchObject({ type: 'code', source: wrapper, language: 'text' });
    expect(result.issues.map((candidate) => candidate.code)).toContain('notebook.deepnote.fallback');
  });

  it('strips raw active HTML and neutralizes unsafe Markdown URLs', () => {
    const source = notebook([
      { id: 'html', cell_type: 'markdown', metadata: {}, source: '# Safe\n<script>steal()</script><p>Hello <strong>learner</strong></p> [bad](javascript:alert(1))' },
      { id: 'raw', cell_type: 'raw', metadata: {}, source: '<iframe src="https://evil.test"></iframe><div>Reference only</div>' },
      { id: 'output', cell_type: 'code', metadata: {}, source: 'print(1)', outputs: [{ output_type: 'display_data', metadata: {}, data: { 'text/html': '<img src=x onerror=steal()><b>Saved result</b>' } }] },
    ]);
    const result = importIpynb(source, { sourceFile: 'unsafe.ipynb' });
    expect(result.ok).toBe(true);
    const serialized = serializeDeterministic(result.notebook);
    expect(serialized).not.toContain('<script');
    expect(serialized).not.toContain('<iframe');
    expect(serialized).not.toContain('javascript:');
    expect(serialized).not.toContain('onerror');
    expect(serialized).toContain('Saved result');
    expect(result.issues.filter((candidate) => candidate.code === 'notebook.html.stripped').length).toBeGreaterThanOrEqual(2);
  });

  it('imports data-resource tables and images with deterministic media paths', () => {
    const imageBase64 = Buffer.from('not-a-real-png-but-deterministic').toString('base64');
    const source = notebook([{
      id: 'rich', cell_type: 'code', metadata: {}, source: 'display(data)', outputs: [
        {
          output_type: 'display_data', metadata: {}, data: {
            'application/vnd.dataresource+json': {
              schema: { fields: [{ name: 'name' }, { name: 'count' }] },
              data: [{ name: 'A', count: 2 }, { name: 'B', count: 3 }],
            },
            'application/vnd.plotly.v1+json': { data: [] },
          },
        },
        { output_type: 'display_data', metadata: {}, data: { 'image/png': imageBase64, 'text/plain': '<Figure>' } },
      ],
    }]);
    const result = importIpynb(source, { sourceFile: 'rich.ipynb', mediaBasePath: 'assets/notebooks' });
    expect(result.ok).toBe(true);
    expect(result.notebook?.cells[1]).toMatchObject({ type: 'table-output', columns: ['name', 'count'], rows: [['A', 2], ['B', 3]], source: 'reference' });
    expect(result.notebook?.cells[2]).toMatchObject({ type: 'image-output', source: 'reference', image: { path: expect.stringMatching(/^assets\/notebooks\/notebook-rich\/[a-f0-9]{24}\.png$/) } });
    expect(result.media).toHaveLength(1);
    expect(result.media[0]?.contentBase64).toBe(imageBase64);
    expect(result.issues.map((candidate) => candidate.code)).toContain('notebook.mime.unsupported');
  });

  it('resolves notebook attachments and caller-supplied local media without filesystem access', () => {
    const attached = Buffer.from('attached').toString('base64');
    const local = Buffer.from('local').toString('base64');
    const source = notebook([{
      id: 'media', cell_type: 'markdown', metadata: {},
      source: '![Attached](attachment:diagram.png)\n![Local](images/chart.png)',
      attachments: { 'diagram.png': { 'image/png': attached } },
    }]);
    const result = importIpynb(source, {
      sourceFile: 'media.ipynb',
      localMedia: [{ sourcePath: 'images/chart.png', mimeType: 'image/png', contentBase64: local }],
    });
    expect(result.ok).toBe(true);
    expect(result.media).toHaveLength(2);
    const markdown = result.notebook?.cells[0];
    expect(markdown?.type).toBe('markdown');
    if (markdown?.type === 'markdown') {
      expect(markdown.markdown).not.toContain('attachment:');
      expect(markdown.markdown).not.toContain('images/chart.png');
      expect(markdown.markdown.match(/media\/notebook-media\/[a-f0-9]{24}\.png/g)).toHaveLength(2);
    }
  });

  it('warns instead of silently accepting unsupported MIME types', () => {
    const source = notebook([{
      id: 'unsupported', cell_type: 'code', metadata: {}, source: 'plot()', outputs: [{
        output_type: 'display_data', metadata: {}, data: { 'application/javascript': 'alert(1)' },
      }],
    }]);
    const result = importIpynb(source, { sourceFile: 'unsupported.ipynb' });
    expect(result.ok).toBe(true);
    expect(result.notebook?.cells).toHaveLength(1);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: 'notebook.mime.unsupported', mimeType: 'application/javascript', severity: 'warning' }));
  });

  it.each([
    ['not JSON', '{'],
    ['non-object', '[]'],
    ['missing cells', JSON.stringify({ nbformat: 4, metadata: {} })],
    ['old format', JSON.stringify({ nbformat: 3, cells: [], metadata: {} })],
    ['bad cell source', notebook([{ cell_type: 'markdown', source: 42, metadata: {} }])],
    ['unknown cell', notebook([{ cell_type: 'future', source: '', metadata: {} }])],
  ])('returns structured errors for malformed notebooks: %s', (_label, source) => {
    const result = importIpynb(source, { sourceFile: 'malformed.ipynb' });
    expect(result.ok).toBe(false);
    expect(result.notebook).toBeUndefined();
    expect(result.issues.some((candidate) => candidate.severity === 'error')).toBe(true);
  });

  it('rejects unsafe media paths and invalid image payloads', () => {
    const badPath = importIpynb(notebook([]), { sourceFile: 'safe.ipynb', mediaBasePath: '../escape' });
    expect(badPath.ok).toBe(false);
    expect(badPath.issues.map((candidate) => candidate.code)).toContain('notebook.media-base.unsafe');

    const badImage = importIpynb(notebook([{
      id: 'image', cell_type: 'code', metadata: {}, source: '',
      outputs: [{ output_type: 'display_data', metadata: {}, data: { 'image/png': '!not-base64!' } }],
    }]), { sourceFile: 'image.ipynb' });
    expect(badImage.ok).toBe(false);
    expect(badImage.issues.map((candidate) => candidate.code)).toContain('notebook.media.base64.invalid');
  });
});
