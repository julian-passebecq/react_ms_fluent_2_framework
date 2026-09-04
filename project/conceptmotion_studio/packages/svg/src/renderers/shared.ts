import { resolveLocalizedText, type EntityId, type LocalizedText } from '@conceptmotion/core';

import { ensureChild, setAttributes, setText, type SvgSurface } from '../dom.js';
import type { RenderOptions } from '../types.js';

export function localText(value: LocalizedText | undefined, options: RenderOptions): string {
  return resolveLocalizedText(value, options.locale ?? 'en');
}

export function renderHeading(
  surface: SvgSurface,
  title: LocalizedText | undefined,
  description: LocalizedText | undefined,
  options: RenderOptions,
): number {
  const resolvedTitle = localText(title, options) || 'ConceptMotion scene';
  const resolvedDescription = localText(description, options);
  const heading = ensureChild(surface.root, 'g[data-role="heading"]', 'g', { 'data-role': 'heading' });
  const titleNode = ensureChild(heading, 'text[data-role="title"]', 'text', {
    'data-role': 'title',
    x: 20,
    y: 26,
    fill: surface.theme.ink,
    'font-size': 16,
    'font-weight': 650,
  });
  setText(titleNode, resolvedTitle);
  const descriptionNode = ensureChild(heading, 'text[data-role="description"]', 'text', {
    'data-role': 'description',
    x: 20,
    y: 46,
    fill: surface.theme.mutedInk,
    'font-size': 11,
  });
  setText(descriptionNode, resolvedDescription);
  if (resolvedDescription) descriptionNode.removeAttribute('display');
  else descriptionNode.setAttribute('display', 'none');
  return resolvedDescription ? 62 : 44;
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function truncate(value: string, length = 22): string {
  return value.length <= length ? value : `${value.slice(0, Math.max(1, length - 1))}…`;
}

export function makeSelectable(
  element: SVGElement,
  id: EntityId,
  label: string,
  options: RenderOptions,
): void {
  setAttributes(element, {
    tabindex: options.onSelect ? 0 : undefined,
    role: options.onSelect ? 'button' : 'group',
    'aria-label': label,
    'aria-pressed': options.onSelect ? options.selectedId === id : undefined,
    'data-selected': options.selectedId === id ? 'true' : undefined,
  });
  element.onclick = options.onSelect ? () => options.onSelect?.(id) : null;
  element.onkeydown = options.onSelect
    ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          options.onSelect?.(id);
        }
      }
    : null;
}

export function clearSelectHandlers(root: SVGElement): void {
  root.querySelectorAll<SVGElement>('[data-key]').forEach((element) => {
    element.onclick = null;
    element.onkeydown = null;
  });
}
