import type { LocalizedText } from './localization';
import { isLocalizedText } from './localization';
import { createValidationResult, validationError, type ValidationIssue, type ValidationResult } from './validation';

export interface ExplanationCodeLine { readonly id: string; readonly text: string }
/** Renderer-facing semantic identities, never selectors or screen coordinates. */
export interface ExplanationFocus {
  readonly entityIds?: readonly string[];
  readonly stateKeys?: readonly string[];
  readonly codeRefs?: readonly string[];
}
export interface ExplanationStateValue { readonly key: string; readonly label: LocalizedText; readonly value: string | number | boolean | null }
export interface ExplanationStep { readonly id: string; readonly title: LocalizedText; readonly focus: ExplanationFocus; readonly state?: readonly ExplanationStateValue[] }
export interface ExplanationTrack {
  /** Loop scenes can use their existing native codeLines instead. */
  readonly codeLines?: readonly ExplanationCodeLine[];
  readonly steps: readonly ExplanationStep[];
}
export interface ExplanationContext { readonly entityIds: readonly string[]; readonly frameCount: number; readonly codeLines?: readonly ExplanationCodeLine[] }
export interface ResolvedExplanation { readonly codeLines: readonly ExplanationCodeLine[]; readonly step: ExplanationStep }
const record = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === 'object' && !Array.isArray(v));
const nonempty = (v: unknown): v is string => typeof v === 'string' && Boolean(v.trim());

export function validateExplanationTrack(input: unknown, context: ExplanationContext): ValidationResult {
  const issues: ValidationIssue[] = [];
  const fail = (path: string, message: string) => issues.push(validationError('explanation.invalid', path, message));
  if (!record(input)) return createValidationResult([validationError('explanation.object', 'explanation', 'Explanation must be an object.')]);
  const code = input.codeLines ?? context.codeLines ?? [];
  const codeIds = new Set<string>();
  if (!Array.isArray(code)) fail('explanation.codeLines', 'Code lines must be an array.');
  else for (const line of code) {
    if (!record(line) || !nonempty(line.id) || typeof line.text !== 'string' || codeIds.has(line.id)) fail('explanation.codeLines', 'Code lines require unique IDs and text.');
    else codeIds.add(line.id);
  }
  if (!Array.isArray(input.steps) || input.steps.length !== context.frameCount || !input.steps.length) {
    fail('explanation.steps', 'There must be exactly one explanation step per semantic frame.');
    return createValidationResult(issues);
  }
  const stepIds = new Set<string>();
  const entities = new Set(context.entityIds);
  for (const [index, step] of input.steps.entries()) {
    const path = `explanation.steps[${index}]`;
    if (!record(step)) { fail(path, 'Step must be an object.'); continue; }
    if (!nonempty(step.id) || stepIds.has(step.id)) fail(`${path}.id`, 'Step IDs must be non-empty and unique.');
    else stepIds.add(step.id);
    if (!isLocalizedText(step.title)) fail(`${path}.title`, 'Step title must be localized text.');
    const stateKeys = new Set<string>();
    if (step.state !== undefined && !Array.isArray(step.state)) fail(`${path}.state`, 'State must be an array.');
    for (const state of Array.isArray(step.state) ? step.state : []) {
      if (!record(state) || !nonempty(state.key) || stateKeys.has(state.key) || !isLocalizedText(state.label) || !(state.value === null || ['string', 'number', 'boolean'].includes(typeof state.value)) || (typeof state.value === 'number' && !Number.isFinite(state.value))) fail(`${path}.state`, 'State needs unique keys, labels and finite scalar values.');
      else stateKeys.add(state.key);
    }
    if (!record(step.focus)) { fail(`${path}.focus`, 'Focus must be an object.'); continue; }
    for (const [key, known] of [['entityIds', entities], ['codeRefs', codeIds], ['stateKeys', stateKeys]] as const) {
      const refs = step.focus[key];
      if (refs === undefined) continue;
      if (!Array.isArray(refs) || refs.some(ref => !nonempty(ref) || !known.has(ref)) || new Set(refs).size !== refs.length) fail(`${path}.focus.${key}`, 'Focus references must be unique known semantic IDs.');
    }
  }
  return createValidationResult(issues);
}

export function resolveExplanationStep(track: ExplanationTrack | undefined, frameIndex: number, context: ExplanationContext): ResolvedExplanation | undefined {
  if (!track) return undefined;
  const result = validateExplanationTrack(track, context);
  if (!result.valid) throw new Error(result.issues.map(issue => `${issue.path}: ${issue.message}`).join('; '));
  const index = Number.isFinite(frameIndex) ? Math.max(0, Math.min(track.steps.length - 1, Math.trunc(frameIndex))) : 0;
  return { codeLines: track.codeLines ?? context.codeLines ?? [], step: track.steps[index] };
}
