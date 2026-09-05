import { createSemanticSnapshot, type SemanticSnapshot } from './entities';
import { planTransitions, type TransitionPlan } from './transitions';
import { isLocalizedText, type LocalizedText } from './localization';
import { resolveExplanationStep, type ExplanationTrack, type ResolvedExplanation } from './explanation';
import { createValidationResult, validationError, type ValidationIssue, type ValidationResult } from './validation';

export interface CollectionContainer { readonly id: string; readonly label: LocalizedText }
export interface CollectionItem { readonly id: string; readonly label: LocalizedText }
export interface CollectionPlacement { readonly itemId: string; readonly containerId: string; readonly annotation?: LocalizedText }
export interface CollectionSummary {
  readonly id: string;
  readonly containerId: string;
  readonly label: LocalizedText;
  readonly sourceItemIds: readonly string[];
  /** Collapse contributors into this result; their identities/provenance remain available. */
  readonly collapsed?: boolean;
}
export interface CollectionFrame {
  readonly id: string;
  /** Complete membership; array order defines order within each container. */
  readonly placements: readonly CollectionPlacement[];
  readonly summaries?: readonly CollectionSummary[];
  readonly activeItemIds?: readonly string[];
  readonly activeContainerIds?: readonly string[];
  readonly operation: string;
  readonly caption: LocalizedText;
}
/** Stable membership, not a graph, query engine or authored geometry. */
export interface CollectionFlowSpec {
  readonly kind: 'collection';
  readonly version: string;
  readonly id: string;
  readonly title: LocalizedText;
  readonly containers: readonly CollectionContainer[];
  readonly items: readonly CollectionItem[];
  readonly frames: readonly CollectionFrame[];
  readonly explanation?: ExplanationTrack;
}
export interface CompiledCollectionFrame {
  readonly index: number;
  readonly frame: CollectionFrame;
  readonly loads: Readonly<Record<string, number>>;
  readonly snapshot: SemanticSnapshot;
  readonly transition: TransitionPlan;
  readonly explanation?: ResolvedExplanation;
}
const record = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === 'object' && !Array.isArray(v));
const nonempty = (v: unknown): v is string => typeof v === 'string' && Boolean(v.trim());

export function validateCollectionFlowSpec(value: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  const fail = (path: string, message: string) => issues.push(validationError('collection.invalid', path, message));
  if (!record(value)) return createValidationResult([validationError('collection.object', '', 'Expected a collection spec.')]);
  if (value.kind !== 'collection' || !nonempty(value.id) || !nonempty(value.version) || !isLocalizedText(value.title)) fail('', 'Collection requires kind, id, version and localized title.');
  const ids = new Set<string>();
  const collect = (name: string): Set<string> => {
    const result = new Set<string>();
    if (!Array.isArray(value[name]) || !value[name].length) { fail(name, 'Expected a non-empty array.'); return result; }
    for (const item of value[name]) {
      if (!record(item) || !nonempty(item.id) || ids.has(item.id) || !isLocalizedText(item.label)) fail(name, 'Items and containers need globally unique IDs and localized labels.');
      else { ids.add(item.id); result.add(item.id); }
    }
    return result;
  };
  const containers = collect('containers');
  const items = collect('items');
  const frameIds = new Set<string>();
  const summaryIds = new Set<string>();
  const summaryIdentity = new Map<string, string>();
  if (!Array.isArray(value.frames) || !value.frames.length) fail('frames', 'Expected non-empty frames.');
  else for (const [index, frame] of value.frames.entries()) {
    const path = `frames[${index}]`;
    if (!record(frame)) { fail(path, 'Expected a frame.'); continue; }
    if (!nonempty(frame.id) || frameIds.has(frame.id)) fail(path, 'Frame IDs must be unique and non-empty.');
    else frameIds.add(frame.id);
    if (!nonempty(frame.operation) || !isLocalizedText(frame.caption)) fail(path, 'Operation and caption are required.');
    const membership = new Map<string, string>();
    if (!Array.isArray(frame.placements)) fail(`${path}.placements`, 'Expected complete placements.');
    else for (const p of frame.placements) {
      if (!record(p) || typeof p.itemId !== 'string' || !items.has(p.itemId) || membership.has(p.itemId) || typeof p.containerId !== 'string' || !containers.has(p.containerId) || (p.annotation !== undefined && !isLocalizedText(p.annotation))) fail(`${path}.placements`, 'Each known item needs exactly one known container and optional localized annotation.');
      else membership.set(p.itemId, p.containerId);
    }
    if (membership.size !== items.size) fail(`${path}.placements`, 'Every item must occur exactly once.');
    for (const [name, known] of [['activeItemIds', items], ['activeContainerIds', containers]] as const) {
      const refs = frame[name];
      if (refs !== undefined && (!Array.isArray(refs) || refs.some(id => !known.has(id)) || new Set(refs).size !== refs.length)) fail(`${path}.${name}`, 'Focus must reference unique known IDs.');
    }
    const seen = new Set<string>();
    const summarizedContainers = new Set<string>();
    const contributors = new Set<string>();
    if (frame.summaries !== undefined && !Array.isArray(frame.summaries)) fail(`${path}.summaries`, 'Expected summaries array.');
    for (const summary of Array.isArray(frame.summaries) ? frame.summaries : []) {
      if (!record(summary) || !nonempty(summary.id) || ids.has(summary.id) || seen.has(summary.id) || typeof summary.containerId !== 'string' || !containers.has(summary.containerId) || !isLocalizedText(summary.label) || (summary.collapsed !== undefined && typeof summary.collapsed !== 'boolean') || !Array.isArray(summary.sourceItemIds) || !summary.sourceItemIds.length) { fail(`${path}.summaries`, 'Summary requires a unique ID, container, label and contributors.'); continue; }
      seen.add(summary.id); summaryIds.add(summary.id);
      if (summarizedContainers.has(summary.containerId)) fail(`${path}.summaries`, 'Use one summary per container.');
      summarizedContainers.add(summary.containerId);
      for (const id of summary.sourceItemIds) {
        if (typeof id !== 'string' || membership.get(id) !== summary.containerId || contributors.has(id)) fail(`${path}.summaries`, 'Contributors must be distinct items in the summary container.');
        contributors.add(id);
      }
      const identity = JSON.stringify([summary.containerId, summary.sourceItemIds]);
      if (summaryIdentity.has(summary.id) && summaryIdentity.get(summary.id) !== identity) fail(`${path}.summaries`, 'A summary ID must retain its container and contributor identity.');
      summaryIdentity.set(summary.id, identity);
    }
  }
  if (value.explanation !== undefined && Array.isArray(value.frames)) {
    try { resolveExplanationStep(value.explanation as ExplanationTrack, 0, { entityIds: [...ids, ...summaryIds], frameCount: value.frames.length }); }
    catch (error) { fail('explanation', error instanceof Error ? error.message : String(error)); }
  }
  return createValidationResult(issues);
}

function snapshot(spec: CollectionFlowSpec, frame: CollectionFrame): SemanticSnapshot {
  const slots = new Map<string, number>();
  const collapsed = new Map((frame.summaries ?? []).filter(s => s.collapsed).flatMap(s => s.sourceItemIds.map(id => [id, s.id] as const)));
  return createSemanticSnapshot(`${spec.id}:${frame.id}`, [
    ...spec.containers.map(c => ({ id: c.id, kind: 'group', label: c.label, emphasized: frame.activeContainerIds?.includes(c.id) ?? false })),
    ...frame.placements.map(p => {
      const slot = slots.get(p.containerId) ?? 0;
      slots.set(p.containerId, slot + 1);
      return { id: p.itemId, kind: 'mark', parentId: p.containerId, position: { lane: p.containerId, slot: collapsed.has(p.itemId) ? 0 : slot }, visible: !collapsed.has(p.itemId), emphasized: frame.activeItemIds?.includes(p.itemId) ?? false, data: { annotation: p.annotation ?? null, collapsedInto: collapsed.get(p.itemId) ?? null } };
    }),
    ...(frame.summaries ?? []).map(s => ({ id: s.id, kind: 'mark', parentId: s.containerId, label: s.label, data: { sourceItemIds: s.sourceItemIds, collapsed: s.collapsed ?? false } })),
  ], { operation: frame.operation });
}

export function compileCollectionFrame(spec: CollectionFlowSpec, requested: number | string): CompiledCollectionFrame {
  const validation = validateCollectionFlowSpec(spec);
  if (!validation.valid) throw new Error(validation.issues.map(i => `${i.path}: ${i.message}`).join('; '));
  const index = typeof requested === 'number' ? requested : spec.frames.findIndex(f => f.id === requested);
  if (!Number.isInteger(index) || index < 0 || index >= spec.frames.length) throw new Error(`Unknown collection frame ${requested}.`);
  const frame = spec.frames[index];
  const current = snapshot(spec, frame);
  const loads = Object.fromEntries(spec.containers.map(c => [c.id, frame.placements.filter(p => p.containerId === c.id).length]));
  return { index, frame, loads, snapshot: current, transition: planTransitions(index ? snapshot(spec, spec.frames[index - 1]) : undefined, current), explanation: resolveExplanationStep(spec.explanation, index, { entityIds: [...spec.containers.map(c => c.id), ...spec.items.map(i => i.id), ...spec.frames.flatMap(f => (f.summaries ?? []).map(s => s.id))], frameCount: spec.frames.length }) };
}
