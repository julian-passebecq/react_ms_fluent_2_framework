import type {
  ChangeEvent,
  ChangeKind,
  ChangeSeverity,
  FeatureRef,
  ImpactRef,
  ImpactState,
  KnowledgeDataset,
  KnowledgeEntry,
  ProductStatus,
  SourceRef,
  Authority
} from './contracts';
import { isLocalizedText } from './localization';

export type KnowledgeValidationSeverity = 'error' | 'warning';

export interface KnowledgeValidationIssue {
  readonly code: string;
  readonly path: string;
  readonly message: string;
  readonly severity: KnowledgeValidationSeverity;
}

export interface KnowledgeValidationResult {
  readonly valid: boolean;
  readonly issues: readonly KnowledgeValidationIssue[];
}

const AUTHORITIES: readonly Authority[] = ['official', 'expert', 'community', 'internal'];
const PRODUCT_STATUSES: readonly ProductStatus[] = ['ga', 'preview', 'deprecated', 'retired', 'unknown'];
const CHANGE_KINDS: readonly ChangeKind[] = ['feature', 'version', 'deprecation', 'retirement', 'docs', 'api', 'pricing', 'security', 'unknown'];
const CHANGE_SEVERITIES: readonly ChangeSeverity[] = ['info', 'review', 'breaking'];
const IMPACT_STATES: readonly ImpactState[] = ['unreviewed', 'reviewed', 'no-change-needed', 'updated'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function issue(code: string, path: string, message: string, severity: KnowledgeValidationSeverity = 'error'): KnowledgeValidationIssue {
  return { code, path, message, severity };
}

function result(issues: readonly KnowledgeValidationIssue[]): KnowledgeValidationResult {
  const sorted = [...issues].sort((left, right) =>
    left.path.localeCompare(right.path) || left.code.localeCompare(right.code) || left.message.localeCompare(right.message)
  );
  return { valid: !sorted.some((candidate) => candidate.severity === 'error'), issues: sorted };
}

function requiredString(value: unknown, path: string, code: string, issues: KnowledgeValidationIssue[]): value is string {
  if (typeof value !== 'string' || !value.trim()) {
    issues.push(issue(code, path, 'A non-empty string is required.'));
    return false;
  }
  return true;
}

function stringArray(value: unknown, path: string, required: boolean, issues: KnowledgeValidationIssue[]): value is readonly string[] {
  if (value === undefined && !required) return true;
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    issues.push(issue('knowledge.string-array.invalid', path, 'Expected an array of non-empty strings.'));
    return false;
  }
  const duplicates = value.filter((item, index) => value.indexOf(item) !== index);
  if (duplicates.length > 0) issues.push(issue('knowledge.string-array.duplicate', path, `Duplicate ids: ${[...new Set(duplicates)].sort().join(', ')}.`, 'warning'));
  return true;
}

function optionalIsoDate(value: unknown, path: string, issues: KnowledgeValidationIssue[], required = false): value is string | undefined {
  if (value === undefined && !required) return true;
  if (typeof value !== 'string' || !value.trim() || !Number.isFinite(Date.parse(value))) {
    issues.push(issue('knowledge.date.invalid', path, 'Expected a valid ISO-compatible date/time string.'));
    return false;
  }
  return true;
}

function optionalHttpUrl(value: unknown, path: string, issues: KnowledgeValidationIssue[], required = false): value is string | undefined {
  if (value === undefined && !required) return true;
  if (typeof value !== 'string' || !/^https?:\/\/[^\s]+$/i.test(value)) {
    issues.push(issue('knowledge.url.invalid', path, 'Expected an absolute http(s) URL.'));
    return false;
  }
  return true;
}

function localized(value: unknown, path: string, issues: KnowledgeValidationIssue[], required = true): void {
  if (value === undefined && !required) return;
  if (!isLocalizedText(value)) issues.push(issue('knowledge.localized-text.invalid', path, 'Expected a string or an EN/NO localized-text object.'));
}

export function validateSourceRef(value: unknown, path = 'source'): KnowledgeValidationResult {
  const issues: KnowledgeValidationIssue[] = [];
  if (!isRecord(value)) return result([issue('knowledge.source.object', path, 'SourceRef must be an object.')]);
  requiredString(value.id, `${path}.id`, 'knowledge.source.id.required', issues);
  localized(value.title, `${path}.title`, issues);
  optionalHttpUrl(value.url, `${path}.url`, issues, true);
  if (!AUTHORITIES.includes(value.authority as Authority)) issues.push(issue('knowledge.source.authority.invalid', `${path}.authority`, 'Unknown source authority.'));
  stringArray(value.productIds, `${path}.productIds`, false, issues);
  optionalIsoDate(value.lastVerifiedAt, `${path}.lastVerifiedAt`, issues);
  return result(issues);
}

export function validateFeatureRef(value: unknown, path = 'feature'): KnowledgeValidationResult {
  const issues: KnowledgeValidationIssue[] = [];
  if (!isRecord(value)) return result([issue('knowledge.feature.object', path, 'FeatureRef must be an object.')]);
  requiredString(value.id, `${path}.id`, 'knowledge.feature.id.required', issues);
  requiredString(value.productId, `${path}.productId`, 'knowledge.feature.product.required', issues);
  localized(value.label, `${path}.label`, issues);
  if (value.status !== undefined && !PRODUCT_STATUSES.includes(value.status as ProductStatus)) {
    issues.push(issue('knowledge.feature.status.invalid', `${path}.status`, 'Unknown product status.'));
  }
  stringArray(value.sourceIds, `${path}.sourceIds`, false, issues);
  return result(issues);
}

export function validateKnowledgeEntry(value: unknown, path = 'entry'): KnowledgeValidationResult {
  const issues: KnowledgeValidationIssue[] = [];
  if (!isRecord(value)) return result([issue('knowledge.entry.object', path, 'KnowledgeEntry must be an object.')]);
  requiredString(value.id, `${path}.id`, 'knowledge.entry.id.required', issues);
  requiredString(value.slug, `${path}.slug`, 'knowledge.entry.slug.required', issues);
  localized(value.title, `${path}.title`, issues);
  localized(value.summary, `${path}.summary`, issues, false);
  for (const key of ['sectionIds', 'tags', 'productIds', 'featureIds', 'sourceIds', 'figureIds', 'challengeIds', 'appliesTo'] as const) {
    stringArray(value[key], `${path}.${key}`, false, issues);
  }
  if (value.status !== undefined && !PRODUCT_STATUSES.includes(value.status as ProductStatus)) {
    issues.push(issue('knowledge.entry.status.invalid', `${path}.status`, 'Unknown product status.'));
  }
  optionalIsoDate(value.verifiedAt, `${path}.verifiedAt`, issues);
  return result(issues);
}

export function validateChangeEvent(value: unknown, path = 'change'): KnowledgeValidationResult {
  const issues: KnowledgeValidationIssue[] = [];
  if (!isRecord(value)) return result([issue('knowledge.change.object', path, 'ChangeEvent must be an object.')]);
  requiredString(value.id, `${path}.id`, 'knowledge.change.id.required', issues);
  requiredString(value.sourceId, `${path}.sourceId`, 'knowledge.change.source.required', issues);
  localized(value.title, `${path}.title`, issues);
  localized(value.evidence, `${path}.evidence`, issues, false);
  optionalIsoDate(value.detectedAt, `${path}.detectedAt`, issues, true);
  optionalIsoDate(value.publishedAt, `${path}.publishedAt`, issues);
  optionalHttpUrl(value.url, `${path}.url`, issues);
  if (!CHANGE_KINDS.includes(value.kind as ChangeKind)) issues.push(issue('knowledge.change.kind.invalid', `${path}.kind`, 'Unknown change kind.'));
  if (!CHANGE_SEVERITIES.includes(value.severity as ChangeSeverity)) issues.push(issue('knowledge.change.severity.invalid', `${path}.severity`, 'Unknown change severity.'));
  stringArray(value.featureIds, `${path}.featureIds`, true, issues);
  return result(issues);
}

export function validateImpactRef(value: unknown, path = 'impact'): KnowledgeValidationResult {
  const issues: KnowledgeValidationIssue[] = [];
  if (!isRecord(value)) return result([issue('knowledge.impact.object', path, 'ImpactRef must be an object.')]);
  requiredString(value.changeEventId, `${path}.changeEventId`, 'knowledge.impact.change.required', issues);
  stringArray(value.knowledgeEntryIds, `${path}.knowledgeEntryIds`, true, issues);
  stringArray(value.figureIds, `${path}.figureIds`, true, issues);
  stringArray(value.challengeIds, `${path}.challengeIds`, true, issues);
  if (!IMPACT_STATES.includes(value.state as ImpactState)) issues.push(issue('knowledge.impact.state.invalid', `${path}.state`, 'Unknown impact state.'));
  return result(issues);
}

function duplicateIdIssues(values: readonly unknown[], path: string): KnowledgeValidationIssue[] {
  const seen = new Set<string>();
  const issues: KnowledgeValidationIssue[] = [];
  values.forEach((value, index) => {
    if (!isRecord(value) || typeof value.id !== 'string') return;
    if (seen.has(value.id)) issues.push(issue('knowledge.id.duplicate', `${path}[${index}].id`, `Duplicate id "${value.id}".`));
    seen.add(value.id);
  });
  return issues;
}

function requiredArray(value: unknown, path: string, issues: KnowledgeValidationIssue[]): readonly unknown[] {
  if (!Array.isArray(value)) {
    issues.push(issue('knowledge.dataset.array.required', path, 'Expected an array.'));
    return [];
  }
  return value;
}

export function validateKnowledgeDataset(value: unknown): KnowledgeValidationResult {
  if (!isRecord(value)) return result([issue('knowledge.dataset.object', '$', 'KnowledgeDataset must be an object.')]);
  const issues: KnowledgeValidationIssue[] = [];
  const sources = requiredArray(value.sources, 'sources', issues);
  const features = requiredArray(value.features, 'features', issues);
  const entries = requiredArray(value.entries, 'entries', issues);
  const changes = value.changes === undefined ? [] : requiredArray(value.changes, 'changes', issues);
  const impacts = value.impacts === undefined ? [] : requiredArray(value.impacts, 'impacts', issues);
  sources.forEach((source, index) => issues.push(...validateSourceRef(source, `sources[${index}]`).issues));
  features.forEach((feature, index) => issues.push(...validateFeatureRef(feature, `features[${index}]`).issues));
  entries.forEach((entry, index) => issues.push(...validateKnowledgeEntry(entry, `entries[${index}]`).issues));
  changes.forEach((change, index) => issues.push(...validateChangeEvent(change, `changes[${index}]`).issues));
  impacts.forEach((impact, index) => issues.push(...validateImpactRef(impact, `impacts[${index}]`).issues));
  issues.push(...duplicateIdIssues(sources, 'sources'), ...duplicateIdIssues(features, 'features'), ...duplicateIdIssues(entries, 'entries'), ...duplicateIdIssues(changes, 'changes'));

  const sourceIds = new Set(sources.filter(isRecord).map((source) => source.id).filter((id): id is string => typeof id === 'string'));
  const featureIds = new Set(features.filter(isRecord).map((feature) => feature.id).filter((id): id is string => typeof id === 'string'));
  const entryIds = new Set(entries.filter(isRecord).map((entry) => entry.id).filter((id): id is string => typeof id === 'string'));
  const changeIds = new Set(changes.filter(isRecord).map((change) => change.id).filter((id): id is string => typeof id === 'string'));

  features.forEach((feature, featureIndex) => {
    if (!isRecord(feature) || !Array.isArray(feature.sourceIds)) return;
    feature.sourceIds.forEach((sourceId, sourceIndex) => {
      if (typeof sourceId === 'string' && !sourceIds.has(sourceId)) issues.push(issue('knowledge.reference.source.unknown', `features[${featureIndex}].sourceIds[${sourceIndex}]`, `Unknown source id "${sourceId}".`));
    });
  });
  entries.forEach((entry, entryIndex) => {
    if (!isRecord(entry)) return;
    if (Array.isArray(entry.sourceIds)) entry.sourceIds.forEach((sourceId, sourceIndex) => {
      if (typeof sourceId === 'string' && !sourceIds.has(sourceId)) issues.push(issue('knowledge.reference.source.unknown', `entries[${entryIndex}].sourceIds[${sourceIndex}]`, `Unknown source id "${sourceId}".`));
    });
    if (Array.isArray(entry.featureIds)) entry.featureIds.forEach((featureId, featureIndex) => {
      if (typeof featureId === 'string' && !featureIds.has(featureId)) issues.push(issue('knowledge.reference.feature.unknown', `entries[${entryIndex}].featureIds[${featureIndex}]`, `Unknown feature id "${featureId}".`));
    });
  });
  changes.forEach((change, changeIndex) => {
    if (!isRecord(change)) return;
    if (typeof change.sourceId === 'string' && !sourceIds.has(change.sourceId)) issues.push(issue('knowledge.reference.source.unknown', `changes[${changeIndex}].sourceId`, `Unknown source id "${change.sourceId}".`));
    if (Array.isArray(change.featureIds)) change.featureIds.forEach((featureId, featureIndex) => {
      if (typeof featureId === 'string' && !featureIds.has(featureId)) issues.push(issue('knowledge.reference.feature.unknown', `changes[${changeIndex}].featureIds[${featureIndex}]`, `Unknown feature id "${featureId}".`));
    });
  });
  impacts.forEach((impact, impactIndex) => {
    if (!isRecord(impact)) return;
    if (typeof impact.changeEventId === 'string' && !changeIds.has(impact.changeEventId)) issues.push(issue('knowledge.reference.change.unknown', `impacts[${impactIndex}].changeEventId`, `Unknown change id "${impact.changeEventId}".`));
    if (Array.isArray(impact.knowledgeEntryIds)) impact.knowledgeEntryIds.forEach((entryId, entryIndex) => {
      if (typeof entryId === 'string' && !entryIds.has(entryId)) issues.push(issue('knowledge.reference.entry.unknown', `impacts[${impactIndex}].knowledgeEntryIds[${entryIndex}]`, `Unknown knowledge entry id "${entryId}".`));
    });
  });
  return result(issues);
}

export function formatKnowledgeValidationIssues(validation: KnowledgeValidationResult): string {
  return validation.issues.map((candidate) => `${candidate.path}: ${candidate.message}`).join('\n');
}

export function assertValidKnowledgeDataset(value: unknown): KnowledgeDataset {
  const validation = validateKnowledgeDataset(value);
  if (!validation.valid) throw new Error(`Invalid KnowledgeDataset:\n${formatKnowledgeValidationIssues(validation)}`);
  return value as KnowledgeDataset;
}
