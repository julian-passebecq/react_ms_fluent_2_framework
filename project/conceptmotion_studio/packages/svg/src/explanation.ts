import { compileTableJoin, layoutDiagram, resolveExplanationStep, resolveLocalizedText, type ExplanationTrack, type ResolvedExplanation, type WorkflowSpec } from '@conceptmotion/core';
import { ensureChild, keyedChildren, setAttributes, setSvgTransform, setText, type SvgSurface } from './dom.js';
import type { SvgSceneSpec } from './scene.js';
import type { RendererViewport } from './types.js';

/** Pure resolution uses only the semantic identity space exposed by each renderer. */
export function resolveSceneExplanation(spec: SvgSceneSpec | WorkflowSpec, frameIndex = 0): ResolvedExplanation | undefined {
  if (spec.kind === 'collection') return compileCollectionFrame(spec, Math.max(0, Math.min(spec.frames.length - 1, Math.trunc(Number.isFinite(frameIndex) ? frameIndex : 0)))).explanation;
  if (!('explanation' in spec) || !spec.explanation) return undefined;
  if (spec.kind === 'loop') return resolveExplanationStep(spec.explanation, frameIndex, { entityIds: spec.items.map(item => item.id), frameCount: spec.frames.length, codeLines: spec.codeLines });
  if (spec.kind === 'table') return resolveExplanationStep(spec.explanation, frameIndex, { entityIds: [...new Set(spec.frames.flatMap(frame => frame.rows.map(row => row.id)))], frameCount: spec.frames.length });
  if (spec.kind === 'join') return resolveExplanationStep(spec.explanation, frameIndex, { entityIds: [...spec.join.left.rows.map(row => `left:${row.id}`), ...spec.join.right.rows.map(row => `right:${row.id}`), ...compileTableJoin(spec.join).rowOrder], frameCount: spec.revealCounts?.length ?? 1 });
  if (spec.kind === 'workflow') return resolveExplanationStep(spec.explanation, frameIndex, { entityIds: spec.nodes.map(node => node.id), frameCount: spec.runs?.[0]?.frames.length ?? 1 });
  return undefined;
}

export function explanationPanelHeight(explanation: ResolvedExplanation | undefined): number {
  return explanation ? 48 + Math.max(explanation.codeLines.length * 24, Math.ceil((explanation.step.state?.length ?? 0) / 2) * 48) : 0;
}

/** One cue grammar reused by existing renderers; this is not a renderer family. */
export function renderExplanationPanel(surface: SvgSurface, explanation: ResolvedExplanation | undefined, top: number, locale: 'en' | 'no' = 'en'): void {
  const old = surface.root.querySelector('g[data-role="explanation"]');
  if (!explanation) { old?.remove(); return; }
  const { codeLines, step } = explanation;
  const layer = ensureChild(surface.root, 'g[data-role="explanation"]', 'g', { 'data-role': 'explanation', 'data-explanation-step': step.id });
  setSvgTransform(layer, 20, top, true, 0);
  const width = surface.viewport.width - 40;
  const codeWidth = width * .56;
  const stateLeft = codeWidth + 24;
  const stateWidth = (width - stateLeft - 12) / 2;
  const focusedCode = new Set(step.focus.codeRefs ?? []);
  const focusedState = new Set(step.focus.stateKeys ?? []);
  const heading = ensureChild(layer, 'text[data-role="cue-title"]', 'text', { 'data-role': 'cue-title', x: 0, y: 14, fill: surface.theme.ink, 'font-size': 12, 'font-weight': 700 });
  setText(heading, resolveLocalizedText(step.title, locale));
  keyedChildren(layer, 'g[data-role="explanation-code"]', 'g', codeLines, line => line.id, (group, line, index) => {
    const focused = focusedCode.has(line.id);
    setAttributes(group, { 'data-role': 'explanation-code', 'data-code-ref': line.id, 'data-focused': String(focused), role: 'group', 'aria-label': `${focused ? 'Current operation: ' : ''}${line.text}` });
    setSvgTransform(group, 0, 28 + index * 24, true, 0);
    ensureChild(group, 'rect', 'rect', { width: codeWidth, height: 22, rx: 3, fill: focused ? surface.theme.accentSubtle : surface.theme.surfaceRaised, stroke: focused ? surface.theme.accent : 'none' });
    const label = ensureChild(group, 'text', 'text', { x: 8, y: 15, fill: surface.theme.ink, 'font-family': surface.theme.monoFontFamily, 'font-size': 11, 'font-weight': focused ? 700 : 400 });
    setText(label, `${focused ? '›' : ' '} ${line.text}`);
  });
  keyedChildren(layer, 'g[data-role="explanation-state"]', 'g', step.state ?? [], state => state.key, (group, state, index) => {
    const focused = focusedState.has(state.key);
    const label = resolveLocalizedText(state.label, locale);
    setAttributes(group, { 'data-role': 'explanation-state', 'data-state-key': state.key, 'data-focused': String(focused), role: 'group', 'aria-label': `${label}: ${String(state.value)}` });
    setSvgTransform(group, stateLeft + (index % 2) * (stateWidth + 12), 28 + Math.floor(index / 2) * 48, true, 0);
    ensureChild(group, 'rect', 'rect', { width: stateWidth, height: 41, rx: 4, fill: focused ? surface.theme.accentSubtle : surface.theme.surfaceRaised, stroke: focused ? surface.theme.accent : surface.theme.border });
    const name = ensureChild(group, 'text[data-role="name"]', 'text', { 'data-role': 'name', x: 9, y: 13, fill: surface.theme.mutedInk, 'font-size': 9 });
    setText(name, label);
    const value = ensureChild(group, 'text[data-role="value"]', 'text', { 'data-role': 'value', x: 9, y: 31, fill: surface.theme.ink, 'font-size': 12, 'font-family': surface.theme.monoFontFamily, 'font-weight': 650 });
    setText(value, String(state.value));
  });
}

/** Content-derived, opt-in geometry; direct legacy renderers retain their defaults. */
export function recommendedSceneViewport(spec: SvgSceneSpec | WorkflowSpec, size: 'compact' | 'regular' | 'expanded'): RendererViewport {
  if (spec.kind === 'diagram' && spec.layout?.provider) {
    // A wide layered flow should not inherit the square canvas of a galaxy.
    // Semantic frames change emphasis, not node bounds, so playback stays still.
    const layout = layoutDiagram(spec);
    const radial = spec.layout.provider === 'radial';
    const fittedHeight = 68 + layout.height * (radial ? 960 / layout.width : Math.min(1, 960 / layout.width));
    const scale = size === 'compact' ? radial ? .7 : .75 : size === 'regular' ? radial ? .85 : .9 : 1;
    const minimum = radial ? size === 'compact' ? 520 : size === 'regular' ? 640 : 760 : size === 'compact' ? 260 : size === 'regular' ? 290 : 320;
    return { width: 960, height: Math.ceil(Math.max(minimum, fittedHeight * scale)) };
  }
  let content = 320;
  let cue = 0;
  if ('explanation' in spec && spec.explanation) {
    const track = spec.explanation as ExplanationTrack;
    cue = Math.max(0, ...track.steps.map((_, index) => explanationPanelHeight(resolveSceneExplanation(spec, index))));
  }
  // The cue panel already includes its bottom padding. Retain a readable gutter
  // without reserving an extra empty line beneath these small explanations.
  if (spec.kind === 'loop') content = cue ? 181 + cue : Math.max(290, 100 + spec.codeLines.length * 24, 252 + Math.ceil(Math.max(0, ...spec.frames.map(frame => Object.keys(frame.variables ?? {}).length)) / 4) * 40);
  else if (spec.kind === 'table') content = 120 + Math.max(0, ...spec.frames.map(frame => frame.rows.length)) * 42 + cue;
  else if (spec.kind === 'collection') content = 100 + collectionGeometry(spec).height + cue;
  else if (spec.kind === 'join') content = 124 + Math.max(spec.join.left.rows.length, spec.join.right.rows.length, compileTableJoin(spec.join).rows.length) * 31 + cue;
  else if (spec.kind === 'workflow') content = cue ? 92 + workflowGeometry(spec).height + cue : 300;
  else if (spec.kind === 'diagram' || spec.kind === 'lineage') content = 520;
  return { width: 960, height: Math.ceil(Math.max(content, size === 'expanded' ? 640 : size === 'regular' ? 420 : 280)) };
}
import { compileCollectionFrame } from '@conceptmotion/core';
import { collectionGeometry } from './renderers/collection.js';
import { workflowGeometry } from './renderers/workflow.js';
