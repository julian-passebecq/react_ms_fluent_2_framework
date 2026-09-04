import { createHash } from 'node:crypto';
import type {
  CodeCell,
  ImageOutputCell,
  JsonPrimitive,
  JsonValue,
  MarkdownCell,
  NotebookCell,
  NotebookSpec,
  TableOutputCell,
  TextOutputCell,
} from '@datapass/content';
import { serializeDeterministic, toCanonicalJsonValue } from '@datapass/content';
import {
  NOTEBOOK_IMPORTER_VERSION,
  type ImportedMediaAsset,
  type NotebookImportIssue,
  type NotebookImportOptions,
  type NotebookImportResult,
  type NotebookImportSeverity,
  type NotebookLocalMediaInput,
} from './contracts';
import { extractDeepnoteSql } from './deepnote';
import { detectCodeCellLanguage, detectNotebookLanguage } from './language';

const IMAGE_MIME_EXTENSIONS: Readonly<Record<string, string>> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

const SUPPORTED_MIME_TYPES = new Set([
  'application/json',
  'application/vnd.dataresource+json',
  'text/html',
  'text/markdown',
  'text/plain',
  ...Object.keys(IMAGE_MIME_EXTENSIONS),
]);

interface IssueContext {
  readonly sourceFile: string;
  readonly path: string;
  readonly cellIndex?: number;
  readonly cellId?: string;
  readonly mimeType?: string;
}

interface MediaState {
  readonly assets: Map<string, ImportedMediaAsset>;
  readonly basePath: string;
  readonly notebookSlug: string;
}

interface OutputResult {
  readonly cells: readonly (TextOutputCell | TableOutputCell | ImageOutputCell)[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

function addIssue(
  issues: NotebookImportIssue[],
  code: string,
  severity: NotebookImportSeverity,
  message: string,
  context: IssueContext,
): void {
  issues.push({ code, severity, message, ...context });
}

function sortedIssues(issues: readonly NotebookImportIssue[]): readonly NotebookImportIssue[] {
  return [...issues].sort((left, right) =>
    left.path.localeCompare(right.path)
      || left.code.localeCompare(right.code)
      || left.message.localeCompare(right.message));
}

function slug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\.ipynb$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeSource(value: unknown): string | undefined {
  if (typeof value === 'string') return value.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
  if (Array.isArray(value) && value.every((line) => typeof line === 'string')) {
    return value.join('').replaceAll('\r\n', '\n').replaceAll('\r', '\n');
  }
  return undefined;
}

function safeBasePath(value: string | undefined): string | undefined {
  const candidate = (value ?? 'media').replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
  if (!candidate || /^[a-z][a-z0-9+.-]*:/i.test(candidate) || /(^|\/)\.\.(\/|$)/.test(candidate)
      || /[\u0000-\u001f\u007f]/.test(candidate)) return undefined;
  return candidate;
}

function normalizeLocalPath(value: string): string | undefined {
  const normalized = value.trim().replaceAll('\\', '/').replace(/^\.\//, '');
  if (!normalized || normalized.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(normalized)
      || /(^|\/)\.\.(\/|$)/.test(normalized) || /[\u0000-\u001f\u007f]/.test(normalized)) return undefined;
  return normalized;
}

function canonicalBase64(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const compact = value.replace(/\s+/g, '');
  if (!compact || compact.length % 4 === 1 || !/^[a-z0-9+/]*={0,2}$/i.test(compact)) return undefined;
  try {
    const bytes = Buffer.from(compact, 'base64');
    if (bytes.length === 0) return undefined;
    return bytes.toString('base64');
  } catch {
    return undefined;
  }
}

function addMedia(
  content: unknown,
  mimeType: string,
  state: MediaState,
  issues: NotebookImportIssue[],
  context: IssueContext,
): ImportedMediaAsset | undefined {
  const contentBase64 = canonicalBase64(content);
  if (!contentBase64) {
    addIssue(issues, 'notebook.media.base64.invalid', 'error', 'Image data is not valid non-empty base64.', { ...context, mimeType });
    return undefined;
  }
  const bytes = Buffer.from(contentBase64, 'base64');
  const digest = sha256(bytes);
  const extension = IMAGE_MIME_EXTENSIONS[mimeType];
  if (!extension) {
    addIssue(issues, 'notebook.mime.unsupported', 'warning', `Unsupported image MIME type "${mimeType}".`, { ...context, mimeType });
    return undefined;
  }
  const path = `${state.basePath}/${state.notebookSlug}/${digest.slice(0, 24)}.${extension}`;
  const asset: ImportedMediaAsset = { path, mimeType, sha256: digest, byteLength: bytes.byteLength, contentBase64 };
  state.assets.set(path, asset);
  return asset;
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&');
}

function stripHtml(value: string): { text: string; changed: boolean } {
  const hasHtml = /<\/?[a-z][^>]*>/i.test(value);
  if (!hasHtml) return { text: value, changed: false };
  const withoutDangerousBlocks = value
    .replace(/<\s*(script|style|iframe|object|embed|svg|math)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|svg|math)\b[^>]*\/?>/gi, '');
  const text = decodeBasicEntities(withoutDangerousBlocks
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/\s*(?:p|div|li|tr|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]*>/g, ''))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text, changed: true };
}

function sanitizeMarkdown(
  markdown: string,
  issues: NotebookImportIssue[],
  context: IssueContext,
): string {
  let output = markdown.replaceAll('\u0000', '');
  const html = stripHtml(output);
  if (html.changed) {
    output = html.text;
    addIssue(issues, 'notebook.html.stripped', 'warning', 'Raw HTML was converted to plain text; active content was removed.', context);
  }
  const unsafeLink = /\]\(\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^)]*\)/gi;
  if (unsafeLink.test(output)) {
    output = output.replace(unsafeLink, '](#)');
    addIssue(issues, 'notebook.url.unsafe', 'warning', 'An unsafe Markdown URL was replaced with a local inert target.', context);
  }
  return output;
}

function markdownImageReferences(markdown: string): readonly { full: string; target: string }[] {
  return [...markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)]
    .map((match) => ({ full: match[0], target: match[1] ?? '' }));
}

function localMediaMap(inputs: readonly NotebookLocalMediaInput[] | undefined): ReadonlyMap<string, NotebookLocalMediaInput> {
  const output = new Map<string, NotebookLocalMediaInput>();
  for (const input of inputs ?? []) {
    const path = normalizeLocalPath(input.sourcePath);
    if (path && !output.has(path)) output.set(path, input);
  }
  return output;
}

function resolveMarkdownMedia(
  markdown: string,
  attachments: unknown,
  localMedia: ReadonlyMap<string, NotebookLocalMediaInput>,
  state: MediaState,
  issues: NotebookImportIssue[],
  context: IssueContext,
): string {
  let output = markdown;
  const attachmentRecord = isRecord(attachments) ? attachments : {};
  for (const name of Object.keys(attachmentRecord).sort()) {
    const representations = attachmentRecord[name];
    if (!isRecord(representations)) {
      addIssue(issues, 'notebook.attachment.invalid', 'warning', `Attachment "${name}" has no MIME representation map.`, context);
      continue;
    }
    const mimeType = Object.keys(representations).sort().find((mime) => mime in IMAGE_MIME_EXTENSIONS);
    for (const mime of Object.keys(representations).sort()) {
      if (!(mime in IMAGE_MIME_EXTENSIONS)) addIssue(issues, 'notebook.mime.unsupported', 'warning', `Unsupported attachment MIME type "${mime}".`, { ...context, mimeType: mime });
    }
    if (!mimeType) continue;
    const media = addMedia(representations[mimeType], mimeType, state, issues, { ...context, mimeType });
    if (media) output = output.replaceAll(`attachment:${name}`, media.path);
  }

  for (const reference of markdownImageReferences(output)) {
    if (/^(?:https?:|data:|#|attachment:)/i.test(reference.target)) continue;
    const normalized = normalizeLocalPath(reference.target);
    const supplied = normalized ? localMedia.get(normalized) : undefined;
    if (!normalized || !supplied) {
      addIssue(issues, 'notebook.media.local.unresolved', 'warning', `Local image "${reference.target}" was not supplied to the importer.`, context);
      continue;
    }
    if (!(supplied.mimeType in IMAGE_MIME_EXTENSIONS)) {
      addIssue(issues, 'notebook.mime.unsupported', 'warning', `Unsupported local image MIME type "${supplied.mimeType}".`, { ...context, mimeType: supplied.mimeType });
      continue;
    }
    const media = addMedia(supplied.contentBase64, supplied.mimeType, state, issues, { ...context, mimeType: supplied.mimeType });
    if (media) output = output.replace(reference.target, media.path);
  }
  return output;
}

function textValue(value: unknown): string | undefined {
  return normalizeSource(value);
}

function primitive(value: unknown): JsonPrimitive {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  try {
    return serializeDeterministic(toCanonicalJsonValue(value), 0);
  } catch {
    return String(value);
  }
}

function tableFromValue(value: unknown): { columns: readonly string[]; rows: readonly (readonly JsonPrimitive[])[] } | undefined {
  if (Array.isArray(value) && value.every(isRecord)) {
    const columns = [...new Set(value.flatMap((row) => Object.keys(row)))].sort();
    return { columns, rows: value.map((row) => columns.map((column) => primitive(row[column]))) };
  }
  if (!isRecord(value)) return undefined;
  if (Array.isArray(value.data) && isRecord(value.schema) && Array.isArray(value.schema.fields)) {
    const columns = value.schema.fields
      .filter(isRecord)
      .map((field) => field.name)
      .filter((name): name is string => typeof name === 'string');
    if (columns.length && value.data.every(isRecord)) {
      return { columns, rows: value.data.map((row) => columns.map((column) => primitive(row[column]))) };
    }
  }
  if (Array.isArray(value.columns) && value.columns.every((column) => typeof column === 'string') && Array.isArray(value.data)) {
    const columns = value.columns as string[];
    const rows = value.data.filter(Array.isArray).map((row) => columns.map((_, index) => primitive(row[index])));
    return { columns, rows };
  }
  return undefined;
}

function outputCellBase(id: string, sourceCellId: string | undefined, sourceIndex: number, sourceHash: string) {
  return { id, sourceCellId, sourceIndex, sourceHash };
}

function processRichOutput(
  output: Record<string, unknown>,
  outputIndex: number,
  codeCellId: string,
  sourceCellId: string | undefined,
  sourceIndex: number,
  sourceFile: string,
  state: MediaState,
  issues: NotebookImportIssue[],
): OutputResult {
  const data = output.data;
  const context: IssueContext = { sourceFile, path: `cells[${sourceIndex}].outputs[${outputIndex}]`, cellIndex: sourceIndex, cellId: sourceCellId };
  if (!isRecord(data)) {
    addIssue(issues, 'notebook.output.data.invalid', 'error', 'Rich output data must be a MIME representation object.', context);
    return { cells: [] };
  }
  const mimes = Object.keys(data).sort();
  mimes.filter((mime) => !SUPPORTED_MIME_TYPES.has(mime)).forEach((mime) => {
    addIssue(issues, 'notebook.mime.unsupported', 'warning', `Unsupported output MIME type "${mime}" was not imported.`, { ...context, mimeType: mime });
  });
  const outputHash = sha256(serializeDeterministic(output, 0));

  for (const mimeType of ['application/vnd.dataresource+json', 'application/json']) {
    if (!(mimeType in data)) continue;
    const table = tableFromValue(data[mimeType]);
    if (table) {
      return { cells: [{
        ...outputCellBase(`${codeCellId}.output.${outputIndex}.table`, sourceCellId, sourceIndex, outputHash),
        type: 'table-output', columns: table.columns, rows: table.rows, source: 'reference',
      }] };
    }
    addIssue(issues, 'notebook.output.table.invalid', 'warning', `The ${mimeType} representation was not a supported tabular shape.`, { ...context, mimeType });
  }

  for (const mimeType of Object.keys(IMAGE_MIME_EXTENSIONS).sort()) {
    if (!(mimeType in data)) continue;
    const media = addMedia(data[mimeType], mimeType, state, issues, { ...context, mimeType });
    if (media) {
      return { cells: [{
        ...outputCellBase(`${codeCellId}.output.${outputIndex}.image`, sourceCellId, sourceIndex, outputHash),
        type: 'image-output', image: media,
        alt: `Reference image from ${sourceFile}, source cell ${sourceIndex + 1}.`, source: 'reference',
      }] };
    }
  }

  if ('text/markdown' in data) {
    const text = textValue(data['text/markdown']);
    if (text !== undefined) return { cells: [{
      ...outputCellBase(`${codeCellId}.output.${outputIndex}.text`, sourceCellId, sourceIndex, outputHash),
      type: 'text-output', text: sanitizeMarkdown(text, issues, context), format: 'markdown', source: 'reference',
    }] };
  }
  if ('text/plain' in data) {
    const text = textValue(data['text/plain']);
    if (text !== undefined) return { cells: [{
      ...outputCellBase(`${codeCellId}.output.${outputIndex}.text`, sourceCellId, sourceIndex, outputHash),
      type: 'text-output', text, format: 'plain', source: 'reference',
    }] };
  }
  if ('text/html' in data) {
    const text = textValue(data['text/html']);
    if (text !== undefined) {
      const stripped = stripHtml(text);
      addIssue(issues, 'notebook.html.stripped', 'warning', 'HTML output was converted to inert plain text.', { ...context, mimeType: 'text/html' });
      return { cells: [{
        ...outputCellBase(`${codeCellId}.output.${outputIndex}.text`, sourceCellId, sourceIndex, outputHash),
        type: 'text-output', text: stripped.text, format: 'plain', source: 'reference',
      }] };
    }
  }
  return { cells: [] };
}

function processOutput(
  value: unknown,
  outputIndex: number,
  codeCellId: string,
  sourceCellId: string | undefined,
  sourceIndex: number,
  sourceFile: string,
  state: MediaState,
  issues: NotebookImportIssue[],
): OutputResult {
  const context: IssueContext = { sourceFile, path: `cells[${sourceIndex}].outputs[${outputIndex}]`, cellIndex: sourceIndex, cellId: sourceCellId };
  if (!isRecord(value)) {
    addIssue(issues, 'notebook.output.object', 'error', 'Notebook output must be an object.', context);
    return { cells: [] };
  }
  const outputType = value.output_type;
  const outputHash = sha256(serializeDeterministic(value, 0));
  if (outputType === 'stream') {
    const text = textValue(value.text);
    if (text === undefined) {
      addIssue(issues, 'notebook.output.stream.invalid', 'error', 'Stream output text must be a string or string array.', context);
      return { cells: [] };
    }
    return { cells: [{
      ...outputCellBase(`${codeCellId}.output.${outputIndex}.text`, sourceCellId, sourceIndex, outputHash),
      type: 'text-output', text, format: 'plain', source: 'reference', isError: value.name === 'stderr' || undefined,
    }] };
  }
  if (outputType === 'error') {
    const traceback = textValue(value.traceback);
    const name = typeof value.ename === 'string' ? value.ename : 'Notebook error';
    const message = typeof value.evalue === 'string' ? value.evalue : '';
    const text = traceback ?? `${name}${message ? `: ${message}` : ''}`;
    return { cells: [{
      ...outputCellBase(`${codeCellId}.output.${outputIndex}.error`, sourceCellId, sourceIndex, outputHash),
      type: 'text-output', text, format: 'plain', source: 'reference', isError: true,
    }] };
  }
  if (outputType === 'display_data' || outputType === 'execute_result' || outputType === 'update_display_data') {
    return processRichOutput(value, outputIndex, codeCellId, sourceCellId, sourceIndex, sourceFile, state, issues);
  }
  addIssue(issues, 'notebook.output.type.unsupported', 'warning', `Unsupported output type "${String(outputType)}" was not imported.`, context);
  return { cells: [] };
}

function inferredTitle(cells: readonly NotebookCell[]): string | undefined {
  for (const cell of cells) {
    if (cell.type !== 'markdown') continue;
    const heading = cell.markdown.match(/^\s*#\s+(.+)$/m)?.[1]?.trim();
    if (heading) return heading;
  }
  return undefined;
}

function stableCellId(
  notebookId: string,
  sourceCellId: string | undefined,
  cellType: string,
  cellHash: string,
  used: Map<string, number>,
  issues: NotebookImportIssue[],
  context: IssueContext,
): string {
  const stablePart = sourceCellId ? slug(sourceCellId) : `${slug(cellType) || 'cell'}-${cellHash.slice(0, 16)}`;
  const base = `${notebookId}.cell.${stablePart || cellHash.slice(0, 16)}`;
  const occurrence = (used.get(base) ?? 0) + 1;
  used.set(base, occurrence);
  if (occurrence > 1) {
    addIssue(issues, 'notebook.cell.id.duplicate', 'warning', `Duplicate source cell identity was disambiguated as occurrence ${occurrence}.`, context);
  }
  return occurrence === 1 ? base : `${base}.${occurrence}`;
}

function fatalResult(sourceFile: string, issues: NotebookImportIssue[], media: MediaState): NotebookImportResult {
  return { ok: false, media: [...media.assets.values()].sort((left, right) => left.path.localeCompare(right.path)), issues: sortedIssues(issues) };
}

/**
 * Imports notebook JSON as deterministic content. It parses data only and has no
 * runtime/kernel hooks; saved outputs are always marked as reference output.
 */
export function importIpynb(source: string, options: NotebookImportOptions): NotebookImportResult {
  const issues: NotebookImportIssue[] = [];
  const sourceFile = typeof options.sourceFile === 'string' ? options.sourceFile.trim() : '';
  const sourceDigest = sha256(source);
  const fileSlug = slug(sourceFile || '') || `notebook-${sourceDigest.slice(0, 12)}`;
  const notebookId = options.id?.trim() || `notebook.${fileSlug}`;
  const configuredBasePath = safeBasePath(options.mediaBasePath);
  const media: MediaState = { assets: new Map(), basePath: configuredBasePath ?? 'media', notebookSlug: slug(notebookId) || sourceDigest.slice(0, 12) };
  if (!sourceFile) addIssue(issues, 'notebook.source-file.required', 'error', 'A source file name is required.', { sourceFile: sourceFile || '', path: 'options.sourceFile' });
  if (!configuredBasePath) addIssue(issues, 'notebook.media-base.unsafe', 'error', 'The media base path is unsafe.', { sourceFile: sourceFile || '', path: 'options.mediaBasePath' });
  if (!notebookId.trim()) addIssue(issues, 'notebook.id.required', 'error', 'A notebook ID is required.', { sourceFile: sourceFile || '', path: 'options.id' });
  if (options.importedAt !== undefined && !Number.isFinite(Date.parse(options.importedAt))) {
    addIssue(issues, 'notebook.imported-at.invalid', 'error', 'Imported-at must be an ISO-compatible date.', { sourceFile: sourceFile || '', path: 'options.importedAt' });
  }
  if (options.license?.requiresAttribution === true && !options.attribution) {
    addIssue(issues, 'notebook.license.attribution.required', 'error', 'Attribution text is required by the configured source license.', { sourceFile, path: 'options.attribution' });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(source) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    addIssue(issues, 'notebook.json.invalid', 'error', `Invalid notebook JSON: ${message}`, { sourceFile: sourceFile || '', path: '$' });
    return fatalResult(sourceFile || '', issues, media);
  }
  if (!isRecord(parsed)) {
    addIssue(issues, 'notebook.object.required', 'error', 'Notebook JSON root must be an object.', { sourceFile: sourceFile || '', path: '$' });
    return fatalResult(sourceFile || '', issues, media);
  }
  if (!Number.isInteger(parsed.nbformat) || (parsed.nbformat as number) < 4) {
    addIssue(issues, 'notebook.format.unsupported', 'error', 'Only nbformat 4 or later notebooks are supported.', { sourceFile: sourceFile || '', path: 'nbformat' });
  }
  if (parsed.nbformat_minor !== undefined && (!Number.isInteger(parsed.nbformat_minor) || (parsed.nbformat_minor as number) < 0)) {
    addIssue(issues, 'notebook.format-minor.invalid', 'error', 'Notebook format minor must be a non-negative integer.', { sourceFile: sourceFile || '', path: 'nbformat_minor' });
  }
  if (!Array.isArray(parsed.cells)) {
    addIssue(issues, 'notebook.cells.required', 'error', 'Notebook cells must be an array.', { sourceFile: sourceFile || '', path: 'cells' });
    return fatalResult(sourceFile || '', issues, media);
  }
  const metadata = isRecord(parsed.metadata) ? parsed.metadata : {};
  if (parsed.metadata !== undefined && !isRecord(parsed.metadata)) {
    addIssue(issues, 'notebook.metadata.invalid', 'error', 'Notebook metadata must be an object.', { sourceFile: sourceFile || '', path: 'metadata' });
  }
  const language = detectNotebookLanguage(metadata, options.defaultLanguage);
  const codeExecution = options.codeExecution ?? 'none';
  const localMedia = localMediaMap(options.localMedia);
  const cells: NotebookCell[] = [];
  const usedIds = new Map<string, number>();

  parsed.cells.forEach((candidate, cellIndex) => {
    const baseContext: IssueContext = { sourceFile: sourceFile || '', path: `cells[${cellIndex}]`, cellIndex };
    if (!isRecord(candidate)) {
      addIssue(issues, 'notebook.cell.object', 'error', 'Notebook cell must be an object.', baseContext);
      return;
    }
    const cellType = candidate.cell_type;
    if (cellType !== 'markdown' && cellType !== 'code' && cellType !== 'raw') {
      addIssue(issues, 'notebook.cell.type.unsupported', 'error', `Unsupported notebook cell type "${String(cellType)}".`, { ...baseContext, path: `${baseContext.path}.cell_type` });
      return;
    }
    const originalSource = normalizeSource(candidate.source);
    if (originalSource === undefined) {
      addIssue(issues, 'notebook.cell.source.invalid', 'error', 'Cell source must be a string or string array.', { ...baseContext, path: `${baseContext.path}.source` });
      return;
    }
    const sourceCellId = typeof candidate.id === 'string' && candidate.id.trim() ? candidate.id : undefined;
    const cellHash = sha256(serializeDeterministic(candidate, 0));
    const id = stableCellId(notebookId, sourceCellId, String(cellType), cellHash, usedIds, issues, { ...baseContext, cellId: sourceCellId });
    const tags = isRecord(candidate.metadata) && Array.isArray(candidate.metadata.tags)
      ? candidate.metadata.tags.filter((tag): tag is string => typeof tag === 'string' && Boolean(tag.trim()))
      : undefined;
    const common = { id, sourceCellId, sourceIndex: cellIndex, sourceHash: cellHash, ...(tags?.length ? { tags } : {}) };

    if (cellType === 'markdown' || cellType === 'raw') {
      let markdown = resolveMarkdownMedia(originalSource, candidate.attachments, localMedia, media, issues, { ...baseContext, cellId: sourceCellId });
      markdown = sanitizeMarkdown(markdown, issues, { ...baseContext, cellId: sourceCellId });
      if (cellType === 'raw') addIssue(issues, 'notebook.raw.converted', 'warning', 'A raw cell was converted to safe Markdown/plain text.', { ...baseContext, cellId: sourceCellId });
      const cell: MarkdownCell = { ...common, type: 'markdown', markdown };
      cells.push(cell);
      return;
    }

    const extraction = extractDeepnoteSql(originalSource);
    const extracted = extraction.status === 'extracted';
    if (extraction.status === 'ambiguous') {
      addIssue(issues, 'notebook.deepnote.fallback', 'warning', `Deepnote SQL wrapper was retained: ${extraction.reason ?? 'extraction was ambiguous'}`, { ...baseContext, cellId: sourceCellId });
    }
    const outputCells: (TextOutputCell | TableOutputCell | ImageOutputCell)[] = [];
    const outputs = candidate.outputs === undefined ? [] : candidate.outputs;
    if (!Array.isArray(outputs)) {
      addIssue(issues, 'notebook.outputs.invalid', 'error', 'Code cell outputs must be an array.', { ...baseContext, path: `${baseContext.path}.outputs`, cellId: sourceCellId });
    } else {
      outputs.forEach((output, outputIndex) => {
        outputCells.push(...processOutput(output, outputIndex, id, sourceCellId, cellIndex, sourceFile || '', media, issues).cells);
      });
    }
    const codeCell: CodeCell = {
      ...common,
      type: 'code',
      language: extracted ? 'sql' : detectCodeCellLanguage(originalSource, candidate.metadata, language),
      source: extracted ? extraction.sql ?? originalSource : originalSource,
      editable: options.codeEditable ?? false,
      execution: codeExecution,
      ...(outputCells.length ? { referenceOutputIds: outputCells.map((output) => output.id) } : {}),
      ...(extracted ? {
        provenance: {
          originalSource,
          transformation: 'deepnote-sql' as const,
          ...(extraction.referencedPaths.length ? { resourcePaths: extraction.referencedPaths } : {}),
        },
      } : {}),
    };
    cells.push(codeCell, ...outputCells);
  });

  if (issues.some((candidate) => candidate.severity === 'error')) return fatalResult(sourceFile || '', issues, media);
  const titleFromMetadata = typeof metadata.title === 'string' && metadata.title.trim() ? metadata.title.trim() : undefined;
  const canonicalMetadata = toCanonicalJsonValue(metadata) as JsonValue;
  const notebook: NotebookSpec = {
    id: notebookId,
    ...(options.title ?? titleFromMetadata ?? inferredTitle(cells) ? { title: options.title ?? titleFromMetadata ?? inferredTitle(cells) } : {}),
    language,
    cells,
    provenance: {
      sourceFile,
      sourceSha256: sourceDigest,
      importerVersion: NOTEBOOK_IMPORTER_VERSION,
      notebookFormat: parsed.nbformat as number,
      ...(typeof parsed.nbformat_minor === 'number' ? { notebookFormatMinor: parsed.nbformat_minor } : {}),
      ...(typeof metadata.id === 'string' && metadata.id.trim() ? { sourceNotebookId: metadata.id } : {}),
      ...(options.importedAt ? { importedAt: options.importedAt } : {}),
      ...(options.sourceId ? { sourceId: options.sourceId } : {}),
      ...(options.attribution ? { attribution: options.attribution } : {}),
      ...(options.license ? { license: options.license } : {}),
    },
    ...(options.sourceId ? { sourceIds: [options.sourceId] } : {}),
    ...(options.runtimeTargetIds?.length ? { runtimeTargetIds: [...options.runtimeTargetIds] } : {}),
    metadata: canonicalMetadata,
  };

  return {
    ok: true,
    notebook,
    media: [...media.assets.values()].sort((left, right) => left.path.localeCompare(right.path)),
    issues: sortedIssues(issues),
  };
}

export function assertImportedNotebook(source: string, options: NotebookImportOptions): NotebookSpec {
  const imported = importIpynb(source, options);
  if (!imported.ok || !imported.notebook) {
    const details = imported.issues.map((candidate) => `${candidate.path}: ${candidate.message}`).join('\n');
    throw new Error(`Notebook import failed:\n${details}`);
  }
  return imported.notebook;
}
