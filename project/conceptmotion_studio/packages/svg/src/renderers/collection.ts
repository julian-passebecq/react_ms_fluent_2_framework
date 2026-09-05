import { resolveLocalizedText, type CollectionFlowSpec, type CompiledCollectionFrame } from '@conceptmotion/core';
import { BaseSvgRenderer } from '../base-renderer.js';
import { ensureChild, keyedChildren, setAccessibleText, setAttributes, setSvgTransform, setText } from '../dom.js';
import { renderExplanationPanel } from '../explanation.js';
import type { RendererRegistration } from '../types.js';
import { localText, makeSelectable, renderHeading } from './shared.js';

export interface CollectionRendererInput { spec: CollectionFlowSpec; frame: CompiledCollectionFrame }

/** Fixed container bounds across the timeline; item positions belong to the renderer. */
export function collectionGeometry(spec: CollectionFlowSpec, width = 960) {
  const columns = Math.min(4, spec.containers.length);
  const capacity = Math.max(1, ...spec.frames.flatMap(f => spec.containers.map(c => f.placements.filter(p => p.containerId === c.id).length)));
  const rowHeight = 44;
  const containerHeight = 84 + capacity * rowHeight;
  return { columns, rowHeight, containerHeight, containerWidth: (width - 40 - (columns - 1) * 24) / columns, height: Math.ceil(spec.containers.length / columns) * (containerHeight + 24) };
}

export class CollectionRenderer extends BaseSvgRenderer<CollectionRendererInput> {
  constructor() { super('collection'); }
  protected render({ spec, frame }: CollectionRendererInput): void {
    const surface = this.surface!;
    const options = this.options;
    const source = frame.frame;
    const top = renderHeading(surface, localText(spec.title, options), `${source.operation.toUpperCase()} · ${localText(source.caption, options)}`, options);
    const geometry = collectionGeometry(spec, surface.viewport.width);
    const { columns, containerWidth, containerHeight, rowHeight } = geometry;
    const positions = new Map(spec.containers.map((c, i) => [c.id, { x: 20 + (i % columns) * (containerWidth + 24), y: top + Math.floor(i / columns) * (containerHeight + 24) }]));
    const summaries = source.summaries ?? [];
    const collapsed = new Map(summaries.filter(s => s.collapsed).flatMap(s => s.sourceItemIds.map(id => [id, s] as const)));
    const active = new Set([...(source.activeItemIds ?? []), ...(frame.explanation?.step.focus.entityIds ?? [])]);
    const description = `${localText(source.caption, options)} ${spec.containers.map(c => `${localText(c.label, options)}: ${frame.loads[c.id]} items`).join('; ')}. ${source.placements.map(p => `${p.itemId} in ${p.containerId}${p.annotation ? `, ${localText(p.annotation, options)}` : ''}`).join('; ')}. ${summaries.map(s => `${localText(s.label, options)}, contributors ${s.sourceItemIds.join(', ')}`).join('; ')}`;
    setAccessibleText(surface, localText(spec.title, options), description);
    const layer = ensureChild(surface.root, 'g[data-role="collection"]', 'g', { 'data-role': 'collection', 'data-operation': source.operation, 'data-frame-id': source.id });
    keyedChildren(layer, 'g[data-role="container"]', 'g', spec.containers, c => c.id, (group, c) => {
      const position = positions.get(c.id)!;
      const focused = source.activeContainerIds?.includes(c.id) || active.has(c.id);
      const count = frame.loads[c.id];
      const noun = summaries.some(s => s.containerId === c.id && s.collapsed) ? count === 1 ? 'contributor' : 'contributors' : count === 1 ? 'item' : 'items';
      setAttributes(group, { 'data-role': 'container', 'data-container-id': c.id, 'data-load': count, role: 'group', 'aria-label': `${localText(c.label, options)}: ${count} ${noun}` });
      setSvgTransform(group, position.x, position.y, true, 0);
      ensureChild(group, 'rect[data-role="box"]', 'rect', { 'data-role': 'box', width: containerWidth, height: containerHeight, rx: 7, fill: surface.theme.surfaceRaised, stroke: focused ? surface.theme.accent : surface.theme.border, 'stroke-width': focused ? 2 : 1 });
      const label = ensureChild(group, 'text[data-role="label"]', 'text', { 'data-role': 'label', x: 12, y: 23, fill: surface.theme.ink, 'font-size': 13, 'font-weight': 700 });
      setText(label, localText(c.label, options));
      const load = ensureChild(group, 'text[data-role="load"]', 'text', { 'data-role': 'load', x: 12, y: 42, fill: surface.theme.mutedInk, 'font-size': 11 });
      setText(load, `${count} ${noun}`);
      ensureChild(group, 'rect[data-role="load-bar"]', 'rect', { 'data-role': 'load-bar', x: 12, y: 49, width: (containerWidth - 24) * frame.loads[c.id] / Math.max(1, spec.items.length), height: 5, fill: surface.theme.accent });
    });
    const slots = new Map<string, number>();
    const itemById = new Map(spec.items.map(i => [i.id, i]));
    // One global keyed layer: moving to another container never recreates an item.
    keyedChildren(layer, 'g[data-role="collection-item"]', 'g', source.placements, p => p.itemId, (group, p) => {
      const slot = slots.get(p.containerId) ?? 0;
      slots.set(p.containerId, slot + 1);
      const position = positions.get(p.containerId)!;
      const summary = collapsed.get(p.itemId);
      const label = resolveLocalizedText(itemById.get(p.itemId)!.label, options.locale ?? 'en');
      const annotation = localText(p.annotation, options);
      setAttributes(group, { 'data-role': 'collection-item', 'data-item-id': p.itemId, 'data-container-id': p.containerId, 'data-slot': slot, 'data-active': String(active.has(p.itemId)), 'data-collapsed-into': summary?.id, opacity: summary ? 0 : 1, 'aria-hidden': summary ? 'true' : undefined });
      setSvgTransform(group, position.x + 12, position.y + 64 + (summary ? 0 : slot) * rowHeight, this.reducedMotion, this.durationMs);
      group.style.transition = this.reducedMotion ? 'none' : `transform ${this.durationMs}ms ease, opacity ${this.durationMs}ms ease`;
      makeSelectable(group, p.itemId, `${label}; ${localText(spec.containers.find(c => c.id === p.containerId)!.label, options)}${annotation ? `; ${annotation}` : ''}`, options);
      if (summary) { group.removeAttribute('tabindex'); group.removeAttribute('role'); }
      ensureChild(group, 'rect', 'rect', { width: containerWidth - 24, height: 36, rx: 4, fill: active.has(p.itemId) ? surface.theme.accentSubtle : surface.theme.surface, stroke: active.has(p.itemId) ? surface.theme.accent : surface.theme.border, 'stroke-width': active.has(p.itemId) ? 2 : 1 });
      const text = ensureChild(group, 'text', 'text', { x: 9, y: 23, fill: surface.theme.ink, 'font-size': 12, 'font-family': surface.theme.monoFontFamily });
      setText(text, `${label}${annotation ? ` · ${annotation}` : ''}`);
    });
    keyedChildren(layer, 'g[data-role="collection-summary"]', 'g', summaries, s => s.id, (group, summary) => {
      const position = positions.get(summary.containerId)!;
      setAttributes(group, { 'data-role': 'collection-summary', 'data-summary-id': summary.id, 'data-source-items': summary.sourceItemIds.join(' '), 'data-collapsed': String(summary.collapsed ?? false), role: 'group', 'aria-label': `${localText(summary.label, options)}; contributors ${summary.sourceItemIds.join(', ')}` });
      setSvgTransform(group, position.x + 12, position.y + (summary.collapsed ? 64 : containerHeight - 20), true, 0);
      ensureChild(group, 'rect', 'rect', { width: containerWidth - 24, height: summary.collapsed ? 66 : 0, rx: 4, fill: surface.theme.accentSubtle });
      const label = ensureChild(group, 'text[data-role="result"]', 'text', { 'data-role': 'result', x: 9, y: 22, fill: surface.theme.ink, 'font-size': 13, 'font-weight': 700 });
      setText(label, localText(summary.label, options));
      const provenance = ensureChild(group, 'text[data-role="contributors"]', 'text', { 'data-role': 'contributors', x: 9, y: 47, fill: surface.theme.mutedInk, 'font-size': 11, display: summary.collapsed ? undefined : 'none' });
      setText(provenance, `From ${summary.sourceItemIds.join(', ')}`);
    });
    renderExplanationPanel(surface, frame.explanation, top + geometry.height, options.locale);
  }
}
export const collectionRendererRegistration: RendererRegistration<CollectionRendererInput> = {
  id: 'collection.flow', family: 'collection', description: 'Stable items moving between semantic containers, with load and contributor summaries.', create: () => new CollectionRenderer(),
};
export function registerCollectionRenderers(registry: { register<Input>(registration: RendererRegistration<Input>): unknown }): void { registry.register(collectionRendererRegistration); }
