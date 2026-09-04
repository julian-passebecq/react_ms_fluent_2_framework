import {
  resolveLocalizedText,
  type CompiledLoopFrame,
  type LocalizedText,
  type LoopSceneSpec,
} from '@conceptmotion/core';

import { BaseSvgRenderer } from '../base-renderer.js';
import {
  ensureChild,
  keyedChildren,
  setAccessibleText,
  setAttributes,
  setSvgTransform,
  setText,
} from '../dom.js';
import type { RendererRegistration } from '../types.js';
import { formatValue, localText, makeSelectable, renderHeading, truncate } from './shared.js';

export interface LoopRendererInput {
  spec: LoopSceneSpec;
  frame: CompiledLoopFrame;
  title?: LocalizedText;
  description?: LocalizedText;
}

export class LoopRenderer extends BaseSvgRenderer<LoopRendererInput> {
  constructor() {
    super('loop');
  }

  protected render(input: LoopRendererInput): void {
    const surface = this.surface!;
    const options = this.options;
    const source = input.frame.frame;
    const title = localText(input.title ?? input.spec.title, options) || input.spec.id;
    const caption = localText(input.description ?? source.caption, options);
    const description = `Iteration ${source.iteration}. ${source.operation}. ${caption}`;
    const top = renderHeading(surface, title, description, options);
    setAccessibleText(surface, title, description);
    const layer = ensureChild(surface.root, 'g[data-role="loop"]', 'g', { 'data-role': 'loop' });

    const itemById = new Map(input.spec.items.map((item) => [item.id, item]));
    const ordered = input.frame.itemOrder.flatMap((id) => {
      const item = itemById.get(id);
      return item ? [item] : [];
    });
    const active = new Set(source.activeItemIds ?? []);
    const done = new Set(source.doneItemIds ?? []);
    const arrayLeft = 24;
    const itemSize = Math.max(42, Math.min(70, (surface.viewport.width * 0.54 - arrayLeft) / Math.max(1, ordered.length)));
    const itemTop = top + 50;

    const operation = ensureChild(layer, 'text[data-role="operation"]', 'text', {
      'data-role': 'operation',
      x: arrayLeft,
      y: top + 22,
      fill: surface.theme.accent,
      'font-size': 11,
      'font-weight': 750,
      'letter-spacing': 1,
    });
    setText(operation, source.operation.toUpperCase());

    keyedChildren(
      layer,
      'g[data-role="item"]',
      'g',
      ordered,
      (item) => item.id,
      (group, item, index, entering) => {
        const isPointer = source.pointerItemId === item.id;
        const isActive = active.has(item.id);
        const isDone = done.has(item.id);
        setAttributes(group, {
          'data-role': 'item',
          'data-item-id': item.id,
          'data-state': isDone ? 'done' : isPointer ? 'pointer' : isActive ? 'active' : 'idle',
          'data-entering': entering ? 'true' : undefined,
        });
        setSvgTransform(group, arrayLeft + index * itemSize, itemTop, this.reducedMotion, this.durationMs);
        makeSelectable(group, item.id, `Item ${item.id}, value ${formatValue(item.value)}${isPointer ? ', current pointer' : ''}`, options);
        const rect = ensureChild(group, 'rect[data-role="box"]', 'rect', {
          'data-role': 'box',
          width: itemSize - 7,
          height: 52,
          rx: surface.theme.radius,
          fill: isActive || isPointer || options.selectedId === item.id ? surface.theme.accentSubtle : surface.theme.surface,
          stroke: isDone ? surface.theme.success : isActive || isPointer ? surface.theme.accent : surface.theme.border,
          'stroke-width': isPointer ? 2.5 : 1.3,
          'stroke-dasharray': isDone ? '4 2' : undefined,
        });
        rect.setAttribute('aria-hidden', 'true');
        const value = ensureChild(group, 'text[data-role="value"]', 'text', {
          'data-role': 'value',
          x: (itemSize - 7) / 2,
          y: 25,
          fill: surface.theme.ink,
          'font-family': surface.theme.monoFontFamily,
          'font-size': 15,
          'font-weight': 650,
          'text-anchor': 'middle',
        });
        setText(value, truncate(formatValue(item.value), 8));
        const label = ensureChild(group, 'text[data-role="label"]', 'text', {
          'data-role': 'label',
          x: (itemSize - 7) / 2,
          y: 42,
          fill: surface.theme.mutedInk,
          'font-size': 9,
          'text-anchor': 'middle',
        });
        setText(label, truncate(resolveLocalizedText(item.label, options.locale ?? 'en') || item.id, 10));
        const pointer = ensureChild(group, 'path[data-role="pointer"]', 'path', {
          'data-role': 'pointer',
          d: `M${(itemSize - 7) / 2 - 6},-12 L${(itemSize - 7) / 2 + 6},-12 L${(itemSize - 7) / 2},-3 Z`,
          fill: surface.theme.accent,
          display: isPointer ? undefined : 'none',
        });
        pointer.setAttribute('aria-hidden', 'true');
      },
    );

    const codeX = Math.max(surface.viewport.width * 0.59, arrayLeft + ordered.length * itemSize + 20);
    const codeWidth = surface.viewport.width - codeX - 20;
    const codeTop = top + 22;
    const codeBackground = ensureChild(layer, 'rect[data-role="code-background"]', 'rect', {
      'data-role': 'code-background',
      x: codeX,
      y: codeTop,
      width: codeWidth,
      height: Math.max(100, input.spec.codeLines.length * 24 + 18),
      rx: surface.theme.radius,
      fill: surface.theme.surfaceRaised,
      stroke: surface.theme.border,
    });
    codeBackground.setAttribute('aria-hidden', 'true');
    const focusedCode = new Set(source.codeLineIds);
    keyedChildren(
      layer,
      'g[data-role="code-line"]',
      'g',
      input.spec.codeLines,
      (line) => line.id,
      (group, line, index) => {
        const focused = focusedCode.has(line.id);
        setAttributes(group, {
          'data-role': 'code-line',
          'data-line-id': line.id,
          'data-focused': String(focused),
        });
        setSvgTransform(group, codeX + 8, codeTop + 10 + index * 24, true, 0);
        const highlight = ensureChild(group, 'rect', 'rect', {
          width: codeWidth - 16,
          height: 21,
          rx: 3,
          fill: focused ? surface.theme.accentSubtle : 'transparent',
          stroke: focused ? surface.theme.accent : 'transparent',
        });
        highlight.setAttribute('aria-hidden', 'true');
        const number = ensureChild(group, 'text[data-role="number"]', 'text', {
          'data-role': 'number',
          x: 6,
          y: 15,
          fill: surface.theme.mutedInk,
          'font-family': surface.theme.monoFontFamily,
          'font-size': 9,
        });
        setText(number, String(index + 1).padStart(2, '0'));
        const text = ensureChild(group, 'text[data-role="code"]', 'text', {
          'data-role': 'code',
          x: 30,
          y: 15,
          fill: surface.theme.ink,
          'font-family': surface.theme.monoFontFamily,
          'font-size': 10,
          'font-weight': focused ? 650 : 400,
        });
        setText(text, truncate(line.text, 44));
      },
    );

    const variables = Object.entries(input.frame.variables).sort(([left], [right]) => left.localeCompare(right));
    const variableTop = itemTop + 78;
    const variableLabel = ensureChild(layer, 'text[data-role="variables-label"]', 'text', {
      'data-role': 'variables-label',
      x: arrayLeft,
      y: variableTop,
      fill: surface.theme.mutedInk,
      'font-size': 10,
      'font-weight': 700,
      'letter-spacing': 0.8,
    });
    setText(variableLabel, `STATE · ITERATION ${source.iteration}`);
    keyedChildren(
      layer,
      'g[data-role="variable"]',
      'g',
      variables,
      ([name]) => name,
      (group, [name, value], index) => {
        setAttributes(group, { 'data-role': 'variable', 'data-variable': name });
        setSvgTransform(group, arrayLeft + index * 130, variableTop + 12, this.reducedMotion, this.durationMs);
        const rect = ensureChild(group, 'rect', 'rect', {
          width: 120,
          height: 30,
          rx: 4,
          fill: surface.theme.surfaceRaised,
          stroke: surface.theme.border,
        });
        rect.setAttribute('aria-hidden', 'true');
        const text = ensureChild(group, 'text', 'text', {
          x: 8,
          y: 19,
          fill: surface.theme.ink,
          'font-size': 10,
          'font-family': surface.theme.monoFontFamily,
        });
        setText(text, `${truncate(name, 10)} = ${truncate(formatValue(value), 12)}`);
      },
    );
  }
}

export const loopRendererRegistration: RendererRegistration<LoopRendererInput> = {
  id: 'algorithm.loop',
  family: 'algorithm',
  description: 'Stable items synchronized with pointer, code focus, iteration, and variables.',
  create: () => new LoopRenderer(),
};

export function registerLoopRenderers(registry: { register<Input>(registration: RendererRegistration<Input>): unknown }): void {
  registry.register(loopRendererRegistration);
}
