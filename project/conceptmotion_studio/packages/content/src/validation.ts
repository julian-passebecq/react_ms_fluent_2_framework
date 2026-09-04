import type {
  AppPreset,
  AppRecipe,
  ArticleLesson,
  AssessmentMode,
  AssessmentSpec,
  ContentCatalog,
  ContentSource,
  CourseModule,
  CourseSpec,
  FigureKind,
  FigureProfile,
  FigureSpec,
  LessonSpec,
  LicenseInfo,
  NotebookCell,
  NotebookSpec,
  ProjectRecord,
  ProjectStatus,
  QuestionDifficulty,
  QuestionOption,
  QuestionSpec,
  QuestionType,
  RuntimeTarget,
  RuntimeTargetKind,
  VocabularyEntry,
  VocabularyTopic,
} from './contracts';
import { toCanonicalJsonValue } from './json';
import { isLocalizedText, SUPPORTED_LOCALES } from './localization';

export type ContentValidationSeverity = 'error' | 'warning';

export interface ContentValidationIssue {
  readonly code: string;
  readonly path: string;
  readonly message: string;
  readonly severity: ContentValidationSeverity;
}

export interface ContentValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ContentValidationIssue[];
}

const FIGURE_KINDS: readonly FigureKind[] = ['concept', 'diagram', 'workflow', 'lineage', 'chart', 'geo', 'static'];
const FIGURE_PROFILES: readonly FigureProfile[] = ['professional', 'editorial', 'sketch'];
const RUNTIME_KINDS: readonly RuntimeTargetKind[] = ['download', 'colab', 'databricks', 'vscode', 'voila', 'mercury', 'external'];
const EXECUTION_MODES = ['none', 'external', 'browser'] as const;
const CELL_TYPES = ['markdown', 'code', 'text-output', 'table-output', 'image-output', 'figure', 'callout', 'exercise'] as const;
const QUESTION_TYPES: readonly QuestionType[] = ['single-choice', 'multiple-choice', 'true-false', 'ordering', 'matching', 'code-choice', 'figure-choice'];
const QUESTION_DIFFICULTIES: readonly QuestionDifficulty[] = ['beginner', 'intermediate', 'advanced'];
const ASSESSMENT_MODES: readonly AssessmentMode[] = ['practice', 'mock-exam', 'interview'];
const PROJECT_STATUSES: readonly ProjectStatus[] = ['active', 'experimental', 'legacy', 'archived'];
const APP_PRESETS: readonly AppPreset[] = ['knowledge', 'learning', 'catalog', 'portfolio-hub'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function issue(
  code: string,
  path: string,
  message: string,
  severity: ContentValidationSeverity = 'error',
): ContentValidationIssue {
  return { code, path, message, severity };
}

function result(issues: readonly ContentValidationIssue[]): ContentValidationResult {
  const stable = [...issues].sort((left, right) =>
    left.path.localeCompare(right.path)
      || left.code.localeCompare(right.code)
      || left.message.localeCompare(right.message));
  return { valid: !stable.some((candidate) => candidate.severity === 'error'), issues: stable };
}

function requiredRecord(value: unknown, path: string, name: string): { record?: Record<string, unknown>; issues: ContentValidationIssue[] } {
  if (!isRecord(value)) return { issues: [issue('content.object.required', path, `${name} must be an object.`)] };
  return { record: value, issues: [] };
}

function requiredString(value: unknown, path: string, issues: ContentValidationIssue[], code = 'content.string.required'): value is string {
  if (typeof value !== 'string' || !value.trim()) {
    issues.push(issue(code, path, 'A non-empty string is required.'));
    return false;
  }
  return true;
}

function optionalBoolean(value: unknown, path: string, issues: ContentValidationIssue[]): void {
  if (value !== undefined && typeof value !== 'boolean') issues.push(issue('content.boolean.invalid', path, 'Expected a boolean.'));
}

function localized(value: unknown, path: string, issues: ContentValidationIssue[], required = true): void {
  if (value === undefined && !required) return;
  if (!isLocalizedText(value)) {
    issues.push(issue('content.localized-text.invalid', path, 'Expected a non-empty string or EN/NO localized-text object.'));
  }
}

function optionalIsoDate(value: unknown, path: string, issues: ContentValidationIssue[]): void {
  if (value === undefined) return;
  if (typeof value !== 'string' || !value.trim() || !Number.isFinite(Date.parse(value))) {
    issues.push(issue('content.date.invalid', path, 'Expected an ISO-compatible date/time string.'));
  }
}

function stringArray(
  value: unknown,
  path: string,
  issues: ContentValidationIssue[],
  options: { required?: boolean; nonEmpty?: boolean } = {},
): readonly string[] {
  if (value === undefined && !options.required) return [];
  if (!Array.isArray(value)) {
    issues.push(issue('content.string-array.invalid', path, 'Expected an array of non-empty strings.'));
    return [];
  }
  if (options.nonEmpty && value.length === 0) issues.push(issue('content.array.empty', path, 'At least one item is required.'));
  const strings: string[] = [];
  value.forEach((candidate, index) => {
    if (typeof candidate !== 'string' || !candidate.trim()) {
      issues.push(issue('content.string-array.item.invalid', `${path}[${index}]`, 'Expected a non-empty string.'));
    } else {
      strings.push(candidate);
    }
  });
  const seen = new Set<string>();
  strings.forEach((candidate, index) => {
    if (seen.has(candidate)) issues.push(issue('content.id.duplicate', `${path}[${index}]`, `Duplicate id "${candidate}".`));
    seen.add(candidate);
  });
  return strings;
}

function localizedArray(value: unknown, path: string, issues: ContentValidationIssue[]): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    issues.push(issue('content.localized-array.invalid', path, 'Expected an array of localized text values.'));
    return;
  }
  value.forEach((candidate, index) => localized(candidate, `${path}[${index}]`, issues));
}

function objectArray(value: unknown, path: string, issues: ContentValidationIssue[], required = true): readonly unknown[] {
  if (value === undefined && !required) return [];
  if (!Array.isArray(value)) {
    issues.push(issue('content.array.invalid', path, 'Expected an array.'));
    return [];
  }
  return value;
}

function isSafeHttpUrl(value: string): boolean {
  return /^https?:\/\/[^\s/@]+(?::\d+)?(?:[/?#][^\s]*)?$/i.test(value)
    && !/[\u0000-\u001f\u007f]/.test(value);
}

function absoluteUrl(value: unknown, path: string, issues: ContentValidationIssue[], required = false): void {
  if (value === undefined && !required) return;
  if (typeof value !== 'string' || !isSafeHttpUrl(value)) {
    issues.push(issue('content.url.unsafe', path, 'Expected a safe absolute http(s) URL without credentials.'));
    return;
  }
  if (value.toLowerCase().startsWith('http://')) {
    issues.push(issue('content.url.insecure', path, 'HTTPS is preferred for external content.', 'warning'));
  }
}

function safeRelativePath(value: unknown, path: string, issues: ContentValidationIssue[], required = false): void {
  if (value === undefined && !required) return;
  if (typeof value !== 'string' || !value.trim() || /^[a-z][a-z0-9+.-]*:/i.test(value)
      || /(^|[\\/])\.\.([\\/]|$)/.test(value) || /[\u0000-\u001f\u007f]/.test(value)) {
    issues.push(issue('content.path.unsafe', path, 'Expected a safe local or application-relative path.'));
  }
}

function validateLicense(value: unknown, attribution: unknown, path: string, issues: ContentValidationIssue[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push(issue('content.license.object', path, 'LicenseInfo must be an object.'));
    return;
  }
  requiredString(value.id, `${path}.id`, issues, 'content.license.id.required');
  if (value.name !== undefined) requiredString(value.name, `${path}.name`, issues);
  absoluteUrl(value.url, `${path}.url`, issues);
  optionalBoolean(value.requiresAttribution, `${path}.requiresAttribution`, issues);
  if (value.requiresAttribution === true && !isLocalizedText(attribution)) {
    issues.push(issue(
      'content.license.attribution.required',
      path.replace(/\.license$/, '.attribution'),
      'Attribution text is required by this source license.',
    ));
  }
}

function duplicateObjectIds(values: readonly unknown[], path: string, issues: ContentValidationIssue[]): Set<string> {
  const ids = new Set<string>();
  values.forEach((candidate, index) => {
    if (!isRecord(candidate) || typeof candidate.id !== 'string' || !candidate.id.trim()) return;
    if (ids.has(candidate.id)) issues.push(issue('content.id.duplicate', `${path}[${index}].id`, `Duplicate id "${candidate.id}".`));
    ids.add(candidate.id);
  });
  return ids;
}

function jsonValue(value: unknown, path: string, issues: ContentValidationIssue[]): void {
  try {
    toCanonicalJsonValue(value);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    issues.push(issue('content.json.invalid', path, message));
  }
}

export function validateContentSource(value: unknown, path = 'source'): ContentValidationResult {
  const checked = requiredRecord(value, path, 'ContentSource');
  const issues = checked.issues;
  if (!checked.record) return result(issues);
  const source = checked.record;
  requiredString(source.id, `${path}.id`, issues, 'content.source.id.required');
  localized(source.title, `${path}.title`, issues);
  absoluteUrl(source.url, `${path}.url`, issues);
  localized(source.attribution, `${path}.attribution`, issues, false);
  validateLicense(source.license, source.attribution, `${path}.license`, issues);
  return result(issues);
}

export function validateFigureSpec(value: unknown, path = 'figure'): ContentValidationResult {
  const checked = requiredRecord(value, path, 'FigureSpec');
  const issues = checked.issues;
  if (!checked.record) return result(issues);
  const figure = checked.record;
  requiredString(figure.id, `${path}.id`, issues, 'content.figure.id.required');
  if (!FIGURE_KINDS.includes(figure.kind as FigureKind)) issues.push(issue('content.figure.kind.invalid', `${path}.kind`, 'Unknown Figure kind.'));
  requiredString(figure.rendererId, `${path}.rendererId`, issues, 'content.figure.renderer.required');
  localized(figure.title, `${path}.title`, issues);
  localized(figure.subtitle, `${path}.subtitle`, issues, false);
  localized(figure.takeaway, `${path}.takeaway`, issues, false);
  localized(figure.fallbackText, `${path}.fallbackText`, issues);
  if (figure.spec === undefined) issues.push(issue('content.figure.spec.required', `${path}.spec`, 'A serializable renderer spec is required.'));
  else jsonValue(figure.spec, `${path}.spec`, issues);
  stringArray(figure.sourceIds, `${path}.sourceIds`, issues);
  stringArray(figure.conceptIds, `${path}.conceptIds`, issues);
  stringArray(figure.featureIds, `${path}.featureIds`, issues);
  optionalIsoDate(figure.verifiedAt, `${path}.verifiedAt`, issues);
  if (figure.reducedMotionState !== undefined && typeof figure.reducedMotionState !== 'string' && typeof figure.reducedMotionState !== 'number') {
    issues.push(issue('content.figure.state.invalid', `${path}.reducedMotionState`, 'Expected a string or number.'));
  }
  if (figure.staticState !== undefined && typeof figure.staticState !== 'string' && typeof figure.staticState !== 'number') {
    issues.push(issue('content.figure.state.invalid', `${path}.staticState`, 'Expected a string or number.'));
  }
  if (figure.profile !== undefined && !FIGURE_PROFILES.includes(figure.profile as FigureProfile)) {
    issues.push(issue('content.figure.profile.invalid', `${path}.profile`, 'Unknown Figure profile.'));
  }
  return result(issues);
}

export function validateRuntimeTarget(value: unknown, path = 'runtimeTarget'): ContentValidationResult {
  const checked = requiredRecord(value, path, 'RuntimeTarget');
  const issues = checked.issues;
  if (!checked.record) return result(issues);
  const target = checked.record;
  requiredString(target.id, `${path}.id`, issues, 'content.runtime.id.required');
  if (!RUNTIME_KINDS.includes(target.kind as RuntimeTargetKind)) issues.push(issue('content.runtime.kind.invalid', `${path}.kind`, 'Unknown runtime target kind.'));
  localized(target.label, `${path}.label`, issues);
  localized(target.description, `${path}.description`, issues, false);
  optionalBoolean(target.executesExternally, `${path}.executesExternally`, issues);
  if (typeof target.executesExternally !== 'boolean') issues.push(issue('content.runtime.external.required', `${path}.executesExternally`, 'Execution location must be declared explicitly.'));
  stringArray(target.runtimeRequirements, `${path}.runtimeRequirements`, issues);
  if (target.kind === 'download') {
    safeRelativePath(target.downloadPath, `${path}.downloadPath`, issues, true);
    if (target.executesExternally === true) issues.push(issue('content.runtime.download.execution', `${path}.executesExternally`, 'A download target does not itself execute content.'));
    if (target.url !== undefined) absoluteUrl(target.url, `${path}.url`, issues);
  } else {
    absoluteUrl(target.url, `${path}.url`, issues, true);
    if (target.downloadPath !== undefined) safeRelativePath(target.downloadPath, `${path}.downloadPath`, issues);
    if (['colab', 'databricks', 'vscode', 'voila', 'mercury'].includes(String(target.kind)) && target.executesExternally !== true) {
      issues.push(issue('content.runtime.execution-location.invalid', `${path}.executesExternally`, 'This runtime kind must be labeled as external execution.'));
    }
  }
  return result(issues);
}

function validateNotebookProvenance(value: unknown, path: string, issues: ContentValidationIssue[]): void {
  if (!isRecord(value)) {
    issues.push(issue('content.notebook.provenance.object', path, 'Notebook provenance must be an object.'));
    return;
  }
  requiredString(value.sourceFile, `${path}.sourceFile`, issues, 'content.notebook.source-file.required');
  if (typeof value.sourceSha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(value.sourceSha256)) {
    issues.push(issue('content.notebook.sha256.invalid', `${path}.sourceSha256`, 'Expected a 64-character SHA-256 digest.'));
  }
  requiredString(value.importerVersion, `${path}.importerVersion`, issues, 'content.notebook.importer-version.required');
  if (!Number.isInteger(value.notebookFormat) || (value.notebookFormat as number) < 1) {
    issues.push(issue('content.notebook.format.invalid', `${path}.notebookFormat`, 'Expected a positive notebook format integer.'));
  }
  if (value.notebookFormatMinor !== undefined && (!Number.isInteger(value.notebookFormatMinor) || (value.notebookFormatMinor as number) < 0)) {
    issues.push(issue('content.notebook.format-minor.invalid', `${path}.notebookFormatMinor`, 'Expected a non-negative integer.'));
  }
  optionalIsoDate(value.importedAt, `${path}.importedAt`, issues);
  if (value.sourceId !== undefined) requiredString(value.sourceId, `${path}.sourceId`, issues);
  localized(value.attribution, `${path}.attribution`, issues, false);
  validateLicense(value.license, value.attribution, `${path}.license`, issues);
}

function validateQuestionOptions(value: unknown, path: string, issues: ContentValidationIssue[], requireCode = false, requireFigure = false): readonly Record<string, unknown>[] {
  const values = objectArray(value, path, issues);
  if (values.length < 2) issues.push(issue('content.question.options.minimum', path, 'At least two options are required.'));
  const records: Record<string, unknown>[] = [];
  values.forEach((candidate, index) => {
    if (!isRecord(candidate)) {
      issues.push(issue('content.question.option.object', `${path}[${index}]`, 'Question option must be an object.'));
      return;
    }
    records.push(candidate);
    requiredString(candidate.id, `${path}[${index}].id`, issues, 'content.question.option.id.required');
    localized(candidate.label, `${path}[${index}].label`, issues);
    if (requireCode) requiredString(candidate.code, `${path}[${index}].code`, issues, 'content.question.option.code.required');
    if (requireFigure) requiredString(candidate.figureId, `${path}[${index}].figureId`, issues, 'content.question.option.figure.required');
  });
  duplicateObjectIds(values, path, issues);
  return records;
}

function optionIdSet(options: readonly Record<string, unknown>[]): Set<string> {
  return new Set(options.map((candidate) => candidate.id).filter((id): id is string => typeof id === 'string'));
}

function referenceInSet(value: unknown, ids: ReadonlySet<string>, path: string, issues: ContentValidationIssue[], code: string): void {
  if (typeof value === 'string' && value.trim() && !ids.has(value)) {
    issues.push(issue(code, path, `Unknown referenced id "${value}".`));
  }
}

function validateNotebookCell(value: unknown, path: string, issues: ContentValidationIssue[]): void {
  if (!isRecord(value)) {
    issues.push(issue('content.notebook.cell.object', path, 'Notebook cell must be an object.'));
    return;
  }
  requiredString(value.id, `${path}.id`, issues, 'content.notebook.cell.id.required');
  if (!CELL_TYPES.includes(value.type as (typeof CELL_TYPES)[number])) {
    issues.push(issue('content.notebook.cell.type.invalid', `${path}.type`, 'Unknown notebook cell type.'));
    return;
  }
  if (value.sourceCellId !== undefined) requiredString(value.sourceCellId, `${path}.sourceCellId`, issues);
  if (value.sourceIndex !== undefined && (!Number.isInteger(value.sourceIndex) || (value.sourceIndex as number) < 0)) {
    issues.push(issue('content.notebook.cell.index.invalid', `${path}.sourceIndex`, 'Expected a non-negative source index.'));
  }
  stringArray(value.tags, `${path}.tags`, issues);
  if (value.sourceHash !== undefined && (typeof value.sourceHash !== 'string' || !/^[a-f0-9]{64}$/i.test(value.sourceHash))) {
    issues.push(issue('content.notebook.cell.sha256.invalid', `${path}.sourceHash`, 'Expected a 64-character SHA-256 digest.'));
  }

  switch (value.type) {
    case 'markdown':
      if (typeof value.markdown !== 'string') issues.push(issue('content.notebook.markdown.required', `${path}.markdown`, 'Markdown source must be a string.'));
      break;
    case 'code':
      requiredString(value.language, `${path}.language`, issues, 'content.notebook.language.required');
      if (typeof value.source !== 'string') issues.push(issue('content.notebook.code.required', `${path}.source`, 'Code source must be a string.'));
      if (!EXECUTION_MODES.includes(value.execution as (typeof EXECUTION_MODES)[number])) issues.push(issue('content.notebook.execution.invalid', `${path}.execution`, 'Unknown execution mode.'));
      optionalBoolean(value.editable, `${path}.editable`, issues);
      stringArray(value.referenceOutputIds, `${path}.referenceOutputIds`, issues);
      if (value.provenance !== undefined) {
        if (!isRecord(value.provenance)) issues.push(issue('content.notebook.code-provenance.object', `${path}.provenance`, 'Code provenance must be an object.'));
        else {
          if (value.provenance.originalSource !== undefined && typeof value.provenance.originalSource !== 'string') issues.push(issue('content.notebook.original-source.invalid', `${path}.provenance.originalSource`, 'Original source must be a string.'));
          if (value.provenance.transformation !== undefined && value.provenance.transformation !== 'deepnote-sql') issues.push(issue('content.notebook.transformation.invalid', `${path}.provenance.transformation`, 'Unknown code transformation.'));
          stringArray(value.provenance.resourcePaths, `${path}.provenance.resourcePaths`, issues);
        }
      }
      break;
    case 'text-output':
      if (typeof value.text !== 'string') issues.push(issue('content.notebook.text-output.required', `${path}.text`, 'Reference text must be a string.'));
      if (value.source !== 'reference') issues.push(issue('content.notebook.output-source.invalid', `${path}.source`, 'Saved outputs must be labeled as reference output.'));
      if (value.format !== undefined && value.format !== 'plain' && value.format !== 'markdown') issues.push(issue('content.notebook.output-format.invalid', `${path}.format`, 'Unknown text output format.'));
      optionalBoolean(value.isError, `${path}.isError`, issues);
      break;
    case 'table-output': {
      const columns = stringArray(value.columns, `${path}.columns`, issues, { required: true });
      const rows = objectArray(value.rows, `${path}.rows`, issues);
      rows.forEach((row, rowIndex) => {
        if (!Array.isArray(row)) {
          issues.push(issue('content.notebook.table-row.invalid', `${path}.rows[${rowIndex}]`, 'Expected a row array.'));
          return;
        }
        if (row.length !== columns.length) issues.push(issue('content.notebook.table-row.width', `${path}.rows[${rowIndex}]`, 'Row width must equal column count.'));
        row.forEach((cell, columnIndex) => {
          if (cell !== null && !['string', 'number', 'boolean'].includes(typeof cell)) {
            issues.push(issue('content.notebook.table-cell.invalid', `${path}.rows[${rowIndex}][${columnIndex}]`, 'Table cells must be JSON primitives.'));
          }
        });
      });
      if (value.source !== 'reference') issues.push(issue('content.notebook.output-source.invalid', `${path}.source`, 'Saved outputs must be labeled as reference output.'));
      break;
    }
    case 'image-output':
      if (!isRecord(value.image)) issues.push(issue('content.notebook.image.object', `${path}.image`, 'Media reference must be an object.'));
      else {
        safeRelativePath(value.image.path, `${path}.image.path`, issues, true);
        requiredString(value.image.mimeType, `${path}.image.mimeType`, issues, 'content.notebook.image.mime.required');
        if (typeof value.image.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(value.image.sha256)) issues.push(issue('content.notebook.image.sha256.invalid', `${path}.image.sha256`, 'Expected a SHA-256 digest.'));
        if (!Number.isInteger(value.image.byteLength) || (value.image.byteLength as number) < 0) issues.push(issue('content.notebook.image.length.invalid', `${path}.image.byteLength`, 'Expected a non-negative byte length.'));
      }
      localized(value.alt, `${path}.alt`, issues);
      if (value.source !== 'reference') issues.push(issue('content.notebook.output-source.invalid', `${path}.source`, 'Saved outputs must be labeled as reference output.'));
      break;
    case 'figure':
      requiredString(value.figureId, `${path}.figureId`, issues, 'content.notebook.figure.required');
      break;
    case 'callout':
      if (!['note', 'tip', 'warning', 'important'].includes(String(value.tone))) issues.push(issue('content.notebook.callout-tone.invalid', `${path}.tone`, 'Unknown callout tone.'));
      localized(value.title, `${path}.title`, issues, false);
      localized(value.content, `${path}.content`, issues);
      break;
    case 'exercise':
      requiredString(value.language, `${path}.language`, issues, 'content.notebook.language.required');
      if (typeof value.starter !== 'string') issues.push(issue('content.notebook.starter.required', `${path}.starter`, 'Exercise starter must be a string.'));
      localizedArray(value.hints, `${path}.hints`, issues);
      if (value.solution !== undefined && typeof value.solution !== 'string') issues.push(issue('content.notebook.solution.invalid', `${path}.solution`, 'Exercise solution must be a string.'));
      localized(value.explanation, `${path}.explanation`, issues, false);
      if (!EXECUTION_MODES.includes(value.execution as (typeof EXECUTION_MODES)[number])) issues.push(issue('content.notebook.execution.invalid', `${path}.execution`, 'Unknown execution mode.'));
      stringArray(value.referenceOutputIds, `${path}.referenceOutputIds`, issues);
      break;
  }
}

export function validateNotebookSpec(value: unknown, path = 'notebook'): ContentValidationResult {
  const checked = requiredRecord(value, path, 'NotebookSpec');
  const issues = checked.issues;
  if (!checked.record) return result(issues);
  const notebook = checked.record;
  requiredString(notebook.id, `${path}.id`, issues, 'content.notebook.id.required');
  localized(notebook.title, `${path}.title`, issues, false);
  if (notebook.language !== undefined) requiredString(notebook.language, `${path}.language`, issues);
  validateNotebookProvenance(notebook.provenance, `${path}.provenance`, issues);
  stringArray(notebook.sourceIds, `${path}.sourceIds`, issues);
  stringArray(notebook.runtimeTargetIds, `${path}.runtimeTargetIds`, issues);
  if (notebook.metadata !== undefined) jsonValue(notebook.metadata, `${path}.metadata`, issues);
  const cells = objectArray(notebook.cells, `${path}.cells`, issues);
  cells.forEach((cell, index) => validateNotebookCell(cell, `${path}.cells[${index}]`, issues));
  const cellIds = duplicateObjectIds(cells, `${path}.cells`, issues);
  cells.forEach((cell, index) => {
    if (!isRecord(cell)) return;
    if (cell.type === 'code' || cell.type === 'exercise') {
      if (Array.isArray(cell.referenceOutputIds)) cell.referenceOutputIds.forEach((id, referenceIndex) => {
        referenceInSet(id, cellIds, `${path}.cells[${index}].referenceOutputIds[${referenceIndex}]`, issues, 'content.reference.notebook-output.unknown');
      });
    }
  });
  return result(issues);
}

export function validateLessonSpec(value: unknown, path = 'lesson'): ContentValidationResult {
  const checked = requiredRecord(value, path, 'LessonSpec');
  const issues = checked.issues;
  if (!checked.record) return result(issues);
  const lesson = checked.record;
  requiredString(lesson.id, `${path}.id`, issues, 'content.lesson.id.required');
  localized(lesson.title, `${path}.title`, issues);
  localized(lesson.summary, `${path}.summary`, issues, false);
  localizedArray(lesson.objectives, `${path}.objectives`, issues);
  if (lesson.notebookId !== undefined) requiredString(lesson.notebookId, `${path}.notebookId`, issues);
  for (const key of ['conceptIds', 'figureIds', 'challengeIds', 'assessmentIds', 'vocabularyTopicIds', 'sourceIds', 'runtimeTargetIds'] as const) {
    stringArray(lesson[key], `${path}.${key}`, issues);
  }
  return result(issues);
}

function validateCourseModule(value: unknown, path: string, issues: ContentValidationIssue[]): void {
  if (!isRecord(value)) {
    issues.push(issue('content.course.module.object', path, 'CourseModule must be an object.'));
    return;
  }
  requiredString(value.id, `${path}.id`, issues, 'content.course.module.id.required');
  localized(value.title, `${path}.title`, issues);
  localized(value.summary, `${path}.summary`, issues, false);
  const lessons = objectArray(value.lessons, `${path}.lessons`, issues);
  lessons.forEach((lesson, index) => issues.push(...validateLessonSpec(lesson, `${path}.lessons[${index}]`).issues));
  duplicateObjectIds(lessons, `${path}.lessons`, issues);
}

export function validateCourseSpec(value: unknown, path = 'course'): ContentValidationResult {
  const checked = requiredRecord(value, path, 'CourseSpec');
  const issues = checked.issues;
  if (!checked.record) return result(issues);
  const course = checked.record;
  requiredString(course.id, `${path}.id`, issues, 'content.course.id.required');
  localized(course.title, `${path}.title`, issues);
  localized(course.summary, `${path}.summary`, issues, false);
  stringArray(course.sourceIds, `${path}.sourceIds`, issues);
  stringArray(course.tags, `${path}.tags`, issues);
  stringArray(course.runtimeTargetIds, `${path}.runtimeTargetIds`, issues);
  const modules = objectArray(course.modules, `${path}.modules`, issues);
  modules.forEach((module, index) => validateCourseModule(module, `${path}.modules[${index}]`, issues));
  duplicateObjectIds(modules, `${path}.modules`, issues);
  const allLessons = modules.filter(isRecord).flatMap((module) => Array.isArray(module.lessons) ? module.lessons : []);
  duplicateObjectIds(allLessons, `${path}.lessons`, issues);
  return result(issues);
}

export function validateQuestionSpec(value: unknown, path = 'question'): ContentValidationResult {
  const checked = requiredRecord(value, path, 'QuestionSpec');
  const issues = checked.issues;
  if (!checked.record) return result(issues);
  const question = checked.record;
  requiredString(question.id, `${path}.id`, issues, 'content.question.id.required');
  if (!QUESTION_TYPES.includes(question.type as QuestionType)) {
    issues.push(issue('content.question.type.invalid', `${path}.type`, 'Unknown question type.'));
    return result(issues);
  }
  localized(question.prompt, `${path}.prompt`, issues);
  localized(question.explanation, `${path}.explanation`, issues, false);
  stringArray(question.conceptIds, `${path}.conceptIds`, issues);
  stringArray(question.sourceIds, `${path}.sourceIds`, issues);
  stringArray(question.tags, `${path}.tags`, issues);
  if (question.domain !== undefined) requiredString(question.domain, `${path}.domain`, issues);
  if (question.figureId !== undefined) requiredString(question.figureId, `${path}.figureId`, issues);
  if (question.difficulty !== undefined && !QUESTION_DIFFICULTIES.includes(question.difficulty as QuestionDifficulty)) {
    issues.push(issue('content.question.difficulty.invalid', `${path}.difficulty`, 'Unknown question difficulty.'));
  }

  switch (question.type) {
    case 'single-choice': {
      const options = validateQuestionOptions(question.options, `${path}.options`, issues);
      requiredString(question.correctOptionId, `${path}.correctOptionId`, issues);
      referenceInSet(question.correctOptionId, optionIdSet(options), `${path}.correctOptionId`, issues, 'content.reference.question-option.unknown');
      break;
    }
    case 'multiple-choice': {
      const options = validateQuestionOptions(question.options, `${path}.options`, issues);
      const correct = stringArray(question.correctOptionIds, `${path}.correctOptionIds`, issues, { required: true, nonEmpty: true });
      const ids = optionIdSet(options);
      correct.forEach((id, index) => referenceInSet(id, ids, `${path}.correctOptionIds[${index}]`, issues, 'content.reference.question-option.unknown'));
      break;
    }
    case 'true-false':
      if (typeof question.correct !== 'boolean') issues.push(issue('content.question.correct.invalid', `${path}.correct`, 'Expected a boolean answer.'));
      break;
    case 'ordering': {
      const items = validateQuestionOptions(question.items, `${path}.items`, issues);
      const order = stringArray(question.correctOrderIds, `${path}.correctOrderIds`, issues, { required: true, nonEmpty: true });
      const ids = optionIdSet(items);
      order.forEach((id, index) => referenceInSet(id, ids, `${path}.correctOrderIds[${index}]`, issues, 'content.reference.question-item.unknown'));
      if (order.length !== ids.size || new Set(order).size !== ids.size) issues.push(issue('content.question.order.incomplete', `${path}.correctOrderIds`, 'Correct order must contain every item exactly once.'));
      break;
    }
    case 'matching': {
      const left = validateQuestionOptions(question.leftItems, `${path}.leftItems`, issues);
      const right = validateQuestionOptions(question.rightItems, `${path}.rightItems`, issues);
      const leftIds = optionIdSet(left);
      const rightIds = optionIdSet(right);
      const matches = objectArray(question.correctMatches, `${path}.correctMatches`, issues);
      matches.forEach((match, index) => {
        if (!isRecord(match)) {
          issues.push(issue('content.question.match.object', `${path}.correctMatches[${index}]`, 'Matching answer must be an object.'));
          return;
        }
        requiredString(match.leftId, `${path}.correctMatches[${index}].leftId`, issues);
        requiredString(match.rightId, `${path}.correctMatches[${index}].rightId`, issues);
        referenceInSet(match.leftId, leftIds, `${path}.correctMatches[${index}].leftId`, issues, 'content.reference.match-left.unknown');
        referenceInSet(match.rightId, rightIds, `${path}.correctMatches[${index}].rightId`, issues, 'content.reference.match-right.unknown');
      });
      const matchedLeft = new Set(matches.filter(isRecord).map((match) => match.leftId).filter((id): id is string => typeof id === 'string'));
      if (matchedLeft.size !== leftIds.size || matches.length !== leftIds.size) issues.push(issue('content.question.matches.incomplete', `${path}.correctMatches`, 'Every left item must have exactly one match.'));
      break;
    }
    case 'code-choice': {
      requiredString(question.language, `${path}.language`, issues, 'content.question.language.required');
      const options = validateQuestionOptions(question.options, `${path}.options`, issues, true);
      requiredString(question.correctOptionId, `${path}.correctOptionId`, issues);
      referenceInSet(question.correctOptionId, optionIdSet(options), `${path}.correctOptionId`, issues, 'content.reference.question-option.unknown');
      break;
    }
    case 'figure-choice': {
      const options = validateQuestionOptions(question.options, `${path}.options`, issues, false, true);
      requiredString(question.correctOptionId, `${path}.correctOptionId`, issues);
      referenceInSet(question.correctOptionId, optionIdSet(options), `${path}.correctOptionId`, issues, 'content.reference.question-option.unknown');
      break;
    }
  }
  return result(issues);
}

export function validateAssessmentSpec(value: unknown, path = 'assessment'): ContentValidationResult {
  const checked = requiredRecord(value, path, 'AssessmentSpec');
  const issues = checked.issues;
  if (!checked.record) return result(issues);
  const assessment = checked.record;
  requiredString(assessment.id, `${path}.id`, issues, 'content.assessment.id.required');
  localized(assessment.title, `${path}.title`, issues);
  if (!ASSESSMENT_MODES.includes(assessment.mode as AssessmentMode)) issues.push(issue('content.assessment.mode.invalid', `${path}.mode`, 'Unknown assessment mode.'));
  stringArray(assessment.questionIds, `${path}.questionIds`, issues, { required: true, nonEmpty: true });
  stringArray(assessment.tags, `${path}.tags`, issues);
  stringArray(assessment.conceptIds, `${path}.conceptIds`, issues);
  stringArray(assessment.sourceIds, `${path}.sourceIds`, issues);
  if (assessment.durationSeconds !== undefined && (!Number.isInteger(assessment.durationSeconds) || (assessment.durationSeconds as number) <= 0)) {
    issues.push(issue('content.assessment.duration.invalid', `${path}.durationSeconds`, 'Expected a positive integer number of seconds.'));
  }
  if (assessment.passingScore !== undefined && (typeof assessment.passingScore !== 'number' || !Number.isFinite(assessment.passingScore) || assessment.passingScore < 0 || assessment.passingScore > 100)) {
    issues.push(issue('content.assessment.score.invalid', `${path}.passingScore`, 'Expected a passing score from 0 through 100.'));
  }
  return result(issues);
}

export function validateProjectRecord(value: unknown, path = 'project'): ContentValidationResult {
  const checked = requiredRecord(value, path, 'ProjectRecord');
  const issues = checked.issues;
  if (!checked.record) return result(issues);
  const project = checked.record;
  requiredString(project.id, `${path}.id`, issues, 'content.project.id.required');
  requiredString(project.title, `${path}.title`, issues, 'content.project.title.required');
  if (project.summary !== undefined) requiredString(project.summary, `${path}.summary`, issues);
  absoluteUrl(project.url, `${path}.url`, issues, true);
  absoluteUrl(project.repository, `${path}.repository`, issues);
  if (!PROJECT_STATUSES.includes(project.status as ProjectStatus)) issues.push(issue('content.project.status.invalid', `${path}.status`, 'Unknown project status.'));
  requiredString(project.kind, `${path}.kind`, issues, 'content.project.kind.required');
  for (const key of ['features', 'technologies', 'locales'] as const) stringArray(project[key], `${path}.${key}`, issues);
  optionalBoolean(project.featured, `${path}.featured`, issues);
  if (project.order !== undefined && !Number.isFinite(project.order)) issues.push(issue('content.project.order.invalid', `${path}.order`, 'Expected a finite number.'));
  optionalIsoDate(project.verifiedAt, `${path}.verifiedAt`, issues);
  if (project.supersededBy !== undefined) requiredString(project.supersededBy, `${path}.supersededBy`, issues);
  return result(issues);
}

export function validateAppRecipe(value: unknown, path = 'appRecipe'): ContentValidationResult {
  const checked = requiredRecord(value, path, 'AppRecipe');
  const issues = checked.issues;
  if (!checked.record) return result(issues);
  const recipe = checked.record;
  requiredString(recipe.id, `${path}.id`, issues, 'content.app-recipe.id.required');
  if (requiredString(recipe.name, `${path}.name`, issues, 'content.app-recipe.name.required') && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recipe.name)) {
    issues.push(issue('content.app-recipe.name.invalid', `${path}.name`, 'Use a lowercase kebab-case app name.'));
  }
  if (requiredString(recipe.packageName, `${path}.packageName`, issues, 'content.app-recipe.package.required')
      && !/^(?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*$/.test(recipe.packageName)) {
    issues.push(issue('content.app-recipe.package.invalid', `${path}.packageName`, 'Expected a valid npm-style package name.'));
  }
  localized(recipe.title, `${path}.title`, issues);
  if (!APP_PRESETS.includes(recipe.preset as AppPreset)) issues.push(issue('content.app-recipe.preset.invalid', `${path}.preset`, 'Unknown app preset.'));
  const routes = stringArray(recipe.routes, `${path}.routes`, issues, { required: true, nonEmpty: true });
  routes.forEach((route, index) => {
    if (!route.startsWith('/') || route.startsWith('//') || route.includes('..') || /[?#]/.test(route)) issues.push(issue('content.app-recipe.route.invalid', `${path}.routes[${index}]`, 'Routes must be safe absolute application paths.'));
  });
  if (recipe.locales !== undefined) {
    const locales = stringArray(recipe.locales, `${path}.locales`, issues);
    locales.forEach((locale, index) => {
      if (!SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])) issues.push(issue('content.app-recipe.locale.invalid', `${path}.locales[${index}]`, 'Only EN and NO locale infrastructure is supported.'));
    });
  }
  stringArray(recipe.features, `${path}.features`, issues);
  optionalBoolean(recipe.includeEditor, `${path}.includeEditor`, issues);
  if (recipe.projectId !== undefined) requiredString(recipe.projectId, `${path}.projectId`, issues);
  return result(issues);
}

export function validateVocabularyEntry(value: unknown, path = 'vocabularyEntry'): ContentValidationResult {
  const checked = requiredRecord(value, path, 'VocabularyEntry');
  const issues = checked.issues;
  if (!checked.record) return result(issues);
  const entry = checked.record;
  requiredString(entry.id, `${path}.id`, issues, 'content.vocabulary.id.required');
  requiredString(entry.lemma, `${path}.lemma`, issues, 'content.vocabulary.lemma.required');
  requiredString(entry.language, `${path}.language`, issues, 'content.vocabulary.language.required');
  localized(entry.translation, `${path}.translation`, issues, false);
  localized(entry.definition, `${path}.definition`, issues, false);
  localizedArray(entry.examples, `${path}.examples`, issues);
  for (const key of ['topicIds', 'forms', 'sourceIds', 'tags'] as const) stringArray(entry[key], `${path}.${key}`, issues);
  for (const key of ['partOfSpeech', 'difficulty'] as const) if (entry[key] !== undefined) requiredString(entry[key], `${path}.${key}`, issues);
  return result(issues);
}

export function validateVocabularyTopic(value: unknown, path = 'vocabularyTopic'): ContentValidationResult {
  const checked = requiredRecord(value, path, 'VocabularyTopic');
  const issues = checked.issues;
  if (!checked.record) return result(issues);
  const topic = checked.record;
  requiredString(topic.id, `${path}.id`, issues, 'content.vocabulary-topic.id.required');
  localized(topic.title, `${path}.title`, issues);
  stringArray(topic.vocabularyIds, `${path}.vocabularyIds`, issues, { required: true });
  for (const key of ['figureIds', 'articleLessonIds', 'assessmentIds'] as const) stringArray(topic[key], `${path}.${key}`, issues);
  return result(issues);
}

export function validateArticleLesson(value: unknown, path = 'articleLesson'): ContentValidationResult {
  const checked = requiredRecord(value, path, 'ArticleLesson');
  const issues = checked.issues;
  if (!checked.record) return result(issues);
  const article = checked.record;
  requiredString(article.id, `${path}.id`, issues, 'content.article.id.required');
  localized(article.title, `${path}.title`, issues);
  localized(article.summary, `${path}.summary`, issues);
  stringArray(article.sourceIds, `${path}.sourceIds`, issues, { required: true, nonEmpty: true });
  for (const key of ['vocabularyTopicIds', 'figureIds', 'assessmentIds'] as const) stringArray(article[key], `${path}.${key}`, issues);
  localizedArray(article.excerpts, `${path}.excerpts`, issues);
  return result(issues);
}

function addUnknownReferences(
  values: unknown,
  ids: ReadonlySet<string>,
  path: string,
  issues: ContentValidationIssue[],
  code: string,
): void {
  if (!Array.isArray(values)) return;
  values.forEach((candidate, index) => referenceInSet(candidate, ids, `${path}[${index}]`, issues, code));
}

function collectLessons(courses: readonly unknown[]): { lesson: Record<string, unknown>; path: string }[] {
  const lessons: { lesson: Record<string, unknown>; path: string }[] = [];
  courses.forEach((course, courseIndex) => {
    if (!isRecord(course) || !Array.isArray(course.modules)) return;
    course.modules.forEach((module, moduleIndex) => {
      if (!isRecord(module) || !Array.isArray(module.lessons)) return;
      module.lessons.forEach((lesson, lessonIndex) => {
        if (isRecord(lesson)) lessons.push({ lesson, path: `courses[${courseIndex}].modules[${moduleIndex}].lessons[${lessonIndex}]` });
      });
    });
  });
  return lessons;
}

export function validateContentCatalog(value: unknown): ContentValidationResult {
  if (!isRecord(value)) return result([issue('content.catalog.object', '$', 'ContentCatalog must be an object.')]);
  const catalog = value;
  const issues: ContentValidationIssue[] = [];
  if (catalog.version !== '2') issues.push(issue('content.catalog.version.invalid', 'version', 'ContentCatalog version must be "2".'));

  const collections = {
    sources: objectArray(catalog.sources, 'sources', issues, false),
    figures: objectArray(catalog.figures, 'figures', issues, false),
    notebooks: objectArray(catalog.notebooks, 'notebooks', issues, false),
    courses: objectArray(catalog.courses, 'courses', issues, false),
    assessments: objectArray(catalog.assessments, 'assessments', issues, false),
    questions: objectArray(catalog.questions, 'questions', issues, false),
    projects: objectArray(catalog.projects, 'projects', issues, false),
    appRecipes: objectArray(catalog.appRecipes, 'appRecipes', issues, false),
    runtimeTargets: objectArray(catalog.runtimeTargets, 'runtimeTargets', issues, false),
    vocabularyEntries: objectArray(catalog.vocabularyEntries, 'vocabularyEntries', issues, false),
    vocabularyTopics: objectArray(catalog.vocabularyTopics, 'vocabularyTopics', issues, false),
    articleLessons: objectArray(catalog.articleLessons, 'articleLessons', issues, false),
  };

  const validators: readonly [keyof typeof collections, (candidate: unknown, path: string) => ContentValidationResult][] = [
    ['sources', validateContentSource], ['figures', validateFigureSpec], ['notebooks', validateNotebookSpec],
    ['courses', validateCourseSpec], ['assessments', validateAssessmentSpec], ['questions', validateQuestionSpec],
    ['projects', validateProjectRecord], ['appRecipes', validateAppRecipe], ['runtimeTargets', validateRuntimeTarget],
    ['vocabularyEntries', validateVocabularyEntry], ['vocabularyTopics', validateVocabularyTopic], ['articleLessons', validateArticleLesson],
  ];
  for (const [key, validator] of validators) {
    collections[key].forEach((candidate, index) => issues.push(...validator(candidate, `${key}[${index}]`).issues));
  }

  const ids = {
    sources: duplicateObjectIds(collections.sources, 'sources', issues),
    figures: duplicateObjectIds(collections.figures, 'figures', issues),
    notebooks: duplicateObjectIds(collections.notebooks, 'notebooks', issues),
    courses: duplicateObjectIds(collections.courses, 'courses', issues),
    assessments: duplicateObjectIds(collections.assessments, 'assessments', issues),
    questions: duplicateObjectIds(collections.questions, 'questions', issues),
    projects: duplicateObjectIds(collections.projects, 'projects', issues),
    appRecipes: duplicateObjectIds(collections.appRecipes, 'appRecipes', issues),
    runtimeTargets: duplicateObjectIds(collections.runtimeTargets, 'runtimeTargets', issues),
    vocabularyEntries: duplicateObjectIds(collections.vocabularyEntries, 'vocabularyEntries', issues),
    vocabularyTopics: duplicateObjectIds(collections.vocabularyTopics, 'vocabularyTopics', issues),
    articleLessons: duplicateObjectIds(collections.articleLessons, 'articleLessons', issues),
    challenges: new Set(stringArray(catalog.challengeIds, 'challengeIds', issues)),
  };

  collections.figures.forEach((candidate, index) => {
    if (!isRecord(candidate)) return;
    addUnknownReferences(candidate.sourceIds, ids.sources, `figures[${index}].sourceIds`, issues, 'content.reference.source.unknown');
  });
  collections.notebooks.forEach((candidate, index) => {
    if (!isRecord(candidate)) return;
    addUnknownReferences(candidate.sourceIds, ids.sources, `notebooks[${index}].sourceIds`, issues, 'content.reference.source.unknown');
    addUnknownReferences(candidate.runtimeTargetIds, ids.runtimeTargets, `notebooks[${index}].runtimeTargetIds`, issues, 'content.reference.runtime.unknown');
    if (Array.isArray(candidate.cells)) candidate.cells.forEach((cell, cellIndex) => {
      if (isRecord(cell) && cell.type === 'figure') referenceInSet(cell.figureId, ids.figures, `notebooks[${index}].cells[${cellIndex}].figureId`, issues, 'content.reference.figure.unknown');
    });
    if (isRecord(candidate.provenance) && typeof candidate.provenance.sourceId === 'string') {
      referenceInSet(candidate.provenance.sourceId, ids.sources, `notebooks[${index}].provenance.sourceId`, issues, 'content.reference.source.unknown');
    }
  });
  collections.courses.forEach((candidate, index) => {
    if (!isRecord(candidate)) return;
    addUnknownReferences(candidate.sourceIds, ids.sources, `courses[${index}].sourceIds`, issues, 'content.reference.source.unknown');
    addUnknownReferences(candidate.runtimeTargetIds, ids.runtimeTargets, `courses[${index}].runtimeTargetIds`, issues, 'content.reference.runtime.unknown');
  });
  collectLessons(collections.courses).forEach(({ lesson, path }) => {
    referenceInSet(lesson.notebookId, ids.notebooks, `${path}.notebookId`, issues, 'content.reference.notebook.unknown');
    addUnknownReferences(lesson.figureIds, ids.figures, `${path}.figureIds`, issues, 'content.reference.figure.unknown');
    addUnknownReferences(lesson.challengeIds, ids.challenges, `${path}.challengeIds`, issues, 'content.reference.challenge.unknown');
    addUnknownReferences(lesson.assessmentIds, ids.assessments, `${path}.assessmentIds`, issues, 'content.reference.assessment.unknown');
    addUnknownReferences(lesson.vocabularyTopicIds, ids.vocabularyTopics, `${path}.vocabularyTopicIds`, issues, 'content.reference.vocabulary-topic.unknown');
    addUnknownReferences(lesson.sourceIds, ids.sources, `${path}.sourceIds`, issues, 'content.reference.source.unknown');
    addUnknownReferences(lesson.runtimeTargetIds, ids.runtimeTargets, `${path}.runtimeTargetIds`, issues, 'content.reference.runtime.unknown');
  });
  collections.assessments.forEach((candidate, index) => {
    if (!isRecord(candidate)) return;
    addUnknownReferences(candidate.questionIds, ids.questions, `assessments[${index}].questionIds`, issues, 'content.reference.question.unknown');
    addUnknownReferences(candidate.sourceIds, ids.sources, `assessments[${index}].sourceIds`, issues, 'content.reference.source.unknown');
  });
  collections.questions.forEach((candidate, index) => {
    if (!isRecord(candidate)) return;
    referenceInSet(candidate.figureId, ids.figures, `questions[${index}].figureId`, issues, 'content.reference.figure.unknown');
    addUnknownReferences(candidate.sourceIds, ids.sources, `questions[${index}].sourceIds`, issues, 'content.reference.source.unknown');
    if (candidate.type === 'figure-choice' && Array.isArray(candidate.options)) candidate.options.forEach((option, optionIndex) => {
      if (isRecord(option)) referenceInSet(option.figureId, ids.figures, `questions[${index}].options[${optionIndex}].figureId`, issues, 'content.reference.figure.unknown');
    });
  });
  collections.projects.forEach((candidate, index) => {
    if (isRecord(candidate)) referenceInSet(candidate.supersededBy, ids.projects, `projects[${index}].supersededBy`, issues, 'content.reference.project.unknown');
  });
  collections.appRecipes.forEach((candidate, index) => {
    if (isRecord(candidate)) referenceInSet(candidate.projectId, ids.projects, `appRecipes[${index}].projectId`, issues, 'content.reference.project.unknown');
  });
  collections.vocabularyEntries.forEach((candidate, index) => {
    if (!isRecord(candidate)) return;
    addUnknownReferences(candidate.topicIds, ids.vocabularyTopics, `vocabularyEntries[${index}].topicIds`, issues, 'content.reference.vocabulary-topic.unknown');
    addUnknownReferences(candidate.sourceIds, ids.sources, `vocabularyEntries[${index}].sourceIds`, issues, 'content.reference.source.unknown');
  });
  collections.vocabularyTopics.forEach((candidate, index) => {
    if (!isRecord(candidate)) return;
    addUnknownReferences(candidate.vocabularyIds, ids.vocabularyEntries, `vocabularyTopics[${index}].vocabularyIds`, issues, 'content.reference.vocabulary.unknown');
    addUnknownReferences(candidate.figureIds, ids.figures, `vocabularyTopics[${index}].figureIds`, issues, 'content.reference.figure.unknown');
    addUnknownReferences(candidate.articleLessonIds, ids.articleLessons, `vocabularyTopics[${index}].articleLessonIds`, issues, 'content.reference.article.unknown');
    addUnknownReferences(candidate.assessmentIds, ids.assessments, `vocabularyTopics[${index}].assessmentIds`, issues, 'content.reference.assessment.unknown');
  });
  collections.articleLessons.forEach((candidate, index) => {
    if (!isRecord(candidate)) return;
    addUnknownReferences(candidate.sourceIds, ids.sources, `articleLessons[${index}].sourceIds`, issues, 'content.reference.source.unknown');
    addUnknownReferences(candidate.vocabularyTopicIds, ids.vocabularyTopics, `articleLessons[${index}].vocabularyTopicIds`, issues, 'content.reference.vocabulary-topic.unknown');
    addUnknownReferences(candidate.figureIds, ids.figures, `articleLessons[${index}].figureIds`, issues, 'content.reference.figure.unknown');
    addUnknownReferences(candidate.assessmentIds, ids.assessments, `articleLessons[${index}].assessmentIds`, issues, 'content.reference.assessment.unknown');
  });

  return result(issues);
}

export function formatContentValidationIssues(validation: ContentValidationResult): string {
  return validation.issues.map((candidate) => `${candidate.path}: ${candidate.message}`).join('\n');
}

export function assertValidContentCatalog(value: unknown): ContentCatalog {
  const validation = validateContentCatalog(value);
  if (!validation.valid) throw new Error(`Invalid ContentCatalog:\n${formatContentValidationIssues(validation)}`);
  return value as ContentCatalog;
}

export function isQuestionSpec(value: unknown): value is QuestionSpec {
  return validateQuestionSpec(value).valid;
}

export function isNotebookCell(value: unknown): value is NotebookCell {
  const issues: ContentValidationIssue[] = [];
  validateNotebookCell(value, 'cell', issues);
  return result(issues).valid;
}
