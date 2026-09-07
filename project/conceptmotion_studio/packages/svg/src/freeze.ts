import type { FreezeOptions } from './types.js';

const RUNTIME_ATTRIBUTES = new Set([
  'data-entering',
  'data-transitioning',
  'data-cm-owner',
]);

function escapeText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function escapeAttribute(value: string): string {
  return escapeText(value).replaceAll('"', '&quot;');
}

function canonicalSerialize(node: Node): string {
  if (node.nodeType === node.TEXT_NODE) return escapeText(node.nodeValue ?? '');
  if (node.nodeType !== node.ELEMENT_NODE) return '';
  const element = node as Element;
  const name = element.tagName.toLowerCase();
  const attributes = Array.from(element.attributes)
    .map(({ name: attributeName, value }) => [attributeName, value] as const)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([attributeName, value]) => ` ${attributeName}="${escapeAttribute(value)}"`)
    .join('');
  const children = Array.from(element.childNodes).map(canonicalSerialize).join('');
  return `<${name}${attributes}>${children}</${name}>`;
}

export function freezeSvgElement(
  host: SVGSVGElement,
  options: FreezeOptions = {},
): string {
  const clone = host.cloneNode(true) as SVGSVGElement;
  if (options.includeNamespace !== false && !clone.hasAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  if (options.stripRuntimeState !== false) {
    // FigurePlayer namespaces live document ARIA IDs. Standalone frozen SVGs
    // normalize that runtime namespace so repeated exports remain deterministic.
    const playerPrefix = clone.getAttribute('data-figure-player-a11y');
    if (playerPrefix) {
      const owner = clone.getAttribute('data-conceptmotion') ?? 'conceptmotion';
      const title = clone.querySelector(`[id="${playerPrefix}-title"]`);
      const description = clone.querySelector(`[id="${playerPrefix}-description"]`);
      if (title && description) {
        title.id = `${owner}-title`;
        description.id = `${owner}-description`;
        clone.setAttribute('aria-labelledby', `${title.id} ${description.id}`);
      }
      clone.removeAttribute('data-figure-player-a11y');
    }
    // Renderer-owned travelers are decorative runtime cues. Semantic relation
    // routes and final table state remain in the deterministic frozen export.
    clone.querySelectorAll('[data-cm-transient="true"]').forEach((element) => element.remove());
    clone.querySelectorAll<SVGElement>('*').forEach((element) => {
      for (const attribute of RUNTIME_ATTRIBUTES) element.removeAttribute(attribute);
      element.style.removeProperty('transition');
      element.style.removeProperty('animation');
    });
  }
  return canonicalSerialize(clone);
}
