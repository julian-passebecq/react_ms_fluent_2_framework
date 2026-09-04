import type { Rect, RenderOptions } from './types.js';
import { resolveSemanticTheme, type SemanticTheme } from './theme.js';

export const SVG_NS = 'http://www.w3.org/2000/svg';

export function svgElement<K extends keyof SVGElementTagNameMap>(
  owner: Document,
  name: K,
): SVGElementTagNameMap[K] {
  return owner.createElementNS(SVG_NS, name);
}

export function setAttributes(
  element: Element,
  attributes: Record<string, string | number | boolean | null | undefined>,
): void {
  for (const [name, value] of Object.entries(attributes)) {
    if (value === undefined || value === null || value === false) element.removeAttribute(name);
    else element.setAttribute(name, value === true ? '' : String(value));
  }
}

export function setText(element: Element, value: unknown): void {
  element.textContent = value === undefined || value === null ? '' : String(value);
}

export function setSvgTransform(
  element: SVGElement,
  x: number,
  y: number,
  reducedMotion: boolean,
  durationMs: number,
): void {
  const transform = `translate(${round(x)} ${round(y)})`;
  element.setAttribute('transform', transform);
  element.style.transform = `translate(${round(x)}px, ${round(y)}px)`;
  element.style.transition = reducedMotion ? 'none' : `transform ${Math.max(0, durationMs)}ms ease`;
}

export function round(value: number, digits = 2): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

export interface SvgSurface {
  host: SVGSVGElement;
  root: SVGGElement;
  defs: SVGDefsElement;
  title: SVGTitleElement;
  description: SVGDescElement;
  theme: SemanticTheme;
  viewport: { width: number; height: number };
}

export function createSurface(
  host: SVGSVGElement,
  ownerId: string,
  options: RenderOptions = {},
): SvgSurface {
  const document = host.ownerDocument;
  const width = options.width ?? 960;
  const height = options.height ?? 540;
  const theme = resolveSemanticTheme(options.theme);

  host.querySelectorAll(`[data-cm-owner="${ownerId}"]`).forEach((node) => node.remove());
  setAttributes(host, {
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: 'xMidYMid meet',
    role: options.onSelect ? 'group' : 'img',
    'data-conceptmotion': ownerId,
  });
  if (!host.getAttribute('xmlns')) host.setAttribute('xmlns', SVG_NS);

  const title = svgElement(document, 'title');
  const description = svgElement(document, 'desc');
  const defs = svgElement(document, 'defs');
  const root = svgElement(document, 'g');
  for (const node of [title, description, defs, root]) node.setAttribute('data-cm-owner', ownerId);
  root.setAttribute('data-cm-root', ownerId);
  host.prepend(description);
  host.prepend(title);
  host.append(defs, root);
  applyThemeAttributes(host, theme);

  return { host, root, defs, title, description, theme, viewport: { width, height } };
}

export function updateSurface(
  surface: SvgSurface,
  options: RenderOptions = {},
): SvgSurface {
  const width = options.width ?? surface.viewport.width;
  const height = options.height ?? surface.viewport.height;
  const theme = resolveSemanticTheme({ ...surface.theme, ...options.theme });
  surface.host.setAttribute('viewBox', `0 0 ${width} ${height}`);
  surface.host.setAttribute('role', options.onSelect ? 'group' : 'img');
  applyThemeAttributes(surface.host, theme);
  surface.viewport = { width, height };
  surface.theme = theme;
  return surface;
}

export function applyThemeAttributes(host: SVGSVGElement, theme: SemanticTheme): void {
  const roles: Record<string, string | number> = {
    '--cm-surface': theme.surface,
    '--cm-surface-raised': theme.surfaceRaised,
    '--cm-ink': theme.ink,
    '--cm-muted-ink': theme.mutedInk,
    '--cm-border': theme.border,
    '--cm-grid': theme.grid,
    '--cm-accent': theme.accent,
    '--cm-accent-subtle': theme.accentSubtle,
    '--cm-success': theme.success,
    '--cm-warning': theme.warning,
    '--cm-error': theme.error,
    '--cm-info': theme.info,
    '--cm-data-batch': theme.dataBatch,
    '--cm-data-stream': theme.dataStream,
    '--cm-cdc': theme.cdc,
    '--cm-control': theme.control,
    '--cm-lineage': theme.lineage,
    '--cm-radius': theme.radius,
  };
  for (const [name, value] of Object.entries(roles)) host.style.setProperty(name, String(value));
  host.style.background = theme.surface;
  host.style.color = theme.ink;
  host.style.fontFamily = theme.fontFamily;
}

export function ensureChild<K extends keyof SVGElementTagNameMap>(
  parent: SVGElement,
  selector: string,
  tag: K,
  attributes: Record<string, string | number | boolean | null | undefined> = {},
): SVGElementTagNameMap[K] {
  let child = parent.querySelector<SVGElementTagNameMap[K]>(`:scope > ${selector}`);
  if (!child) {
    child = svgElement(parent.ownerDocument, tag);
    parent.append(child);
  }
  setAttributes(child, attributes);
  return child;
}

export function keyedChildren<T, K extends keyof SVGElementTagNameMap>(
  parent: SVGElement,
  selector: string,
  tag: K,
  items: readonly T[],
  key: (item: T) => string,
  update: (element: SVGElementTagNameMap[K], item: T, index: number, entering: boolean) => void,
): SVGElementTagNameMap[K][] {
  const existing = new Map<string, SVGElementTagNameMap[K]>();
  parent.querySelectorAll<SVGElementTagNameMap[K]>(`:scope > ${selector}`).forEach((element) => {
    const id = element.getAttribute('data-key');
    if (id) existing.set(id, element);
  });

  const ordered: SVGElementTagNameMap[K][] = [];
  items.forEach((item, index) => {
    const id = key(item);
    let element = existing.get(id);
    const entering = !element;
    if (!element) {
      element = svgElement(parent.ownerDocument, tag);
      element.setAttribute('data-key', id);
    } else {
      existing.delete(id);
    }
    update(element, item, index, entering);
    parent.append(element);
    ordered.push(element);
  });
  existing.forEach((element) => element.remove());
  return ordered;
}

export function rectContains(rect: Rect, x: number, y: number): boolean {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

export function setAccessibleText(
  surface: SvgSurface,
  title: string,
  description: string,
): void {
  setText(surface.title, title);
  setText(surface.description, description);
  const titleId = `${surface.root.getAttribute('data-cm-root') ?? 'conceptmotion'}-title`;
  const descriptionId = `${surface.root.getAttribute('data-cm-root') ?? 'conceptmotion'}-description`;
  surface.title.id = titleId;
  surface.description.id = descriptionId;
  surface.host.setAttribute('aria-labelledby', `${titleId} ${descriptionId}`);
}
