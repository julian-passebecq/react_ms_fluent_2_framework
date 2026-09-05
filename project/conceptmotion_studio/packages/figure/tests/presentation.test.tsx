import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { freezeSvgElement } from '@conceptmotion/svg';
import type { FigureSpec } from '@datapass/content';
import { FigurePlayer, FigureView, type FigurePresentationSize } from '../src';

const figure: FigureSpec = {
  id: 'figure.presentation', kind: 'concept', rendererId: 'algorithm.loop', title: 'Read the next value',
  fallbackText: 'Two stable values are inspected one at a time.', sourceIds: ['source.internal'], conceptIds: ['concept.scan'],
  spec: { kind: 'loop', version: '3', id: 'presentation', title: 'Read the next value', items: [{ id: 'first', value: 4 }, { id: 'second', value: 7 }],
    codeLines: [{ id: 'read', text: 'value = values[index]' }], frames: [
      { id: 'one', iteration: 0, operation: 'read', caption: 'Inspect the first value.', activeItemIds: ['first'], codeLineIds: ['read'], variables: { index: 0 } },
      { id: 'two', iteration: 1, operation: 'read', caption: 'Inspect the second value.', activeItemIds: ['second'], codeLineIds: ['read'], variables: { index: 1 } },
    ] },
};
const hosts: HTMLElement[] = [];
afterEach(() => hosts.splice(0).forEach(host => host.remove()));
function mountHost() { const host = document.createElement('div'); document.body.append(host); hosts.push(host); return host; }

describe('consumer-controlled Figure presentation', () => {
  it.each([undefined, 'compact', 'regular', 'expanded'] as const)('preserves guarded renderer errors for malformed payloads at size %s', async presentationSize => {
    const host = mountHost(); const root = createRoot(host);
    const malformed = { ...figure, spec: { kind: 'loop' } };
    await act(async () => root.render(<FigureView figure={malformed} presentationSize={presentationSize} reducedMotion />));
    expect(host.querySelector('[role="alert"]')).not.toBeNull();
    expect(host.textContent).toContain('Two stable values are inspected one at a time.');
    await act(async () => root.unmount());
  });
  it('defaults metadata to closed details without hiding human attribution', async () => {
    const host = mountHost(); const root = createRoot(host);
    await act(async () => root.render(<FigureView figure={figure} source="Example authors, CC BY" note="A simplified teaching example." reducedMotion />));
    const details = host.querySelector<HTMLDetailsElement>('.dp-content-details');
    expect(details?.open).toBe(false);
    expect(details?.textContent).toContain('source.internal');
    expect(host.querySelector('.dp-figure-frame__header')?.textContent).not.toContain('concept.scan');
    expect(host.querySelector('figcaption')?.textContent).toContain('Example authors, CC BY');
    expect(host.querySelector('figcaption')?.closest('details')).toBeNull();
    await act(async () => root.render(<FigureView figure={figure} metadataMode="developer" reducedMotion />));
    expect(host.querySelector('.dp-figure-frame__header')?.textContent).toContain('source.internal');
    expect(host.querySelector('.dp-content-details')).toBeNull();
    await act(async () => root.unmount());
  });

  it('sizes the same semantic content without mutating it and keeps exports deterministic per size', async () => {
    const host = mountHost(); const root = createRoot(host); const original = JSON.stringify(figure);
    const heights: number[] = [];
    for (const size of ['compact', 'regular', 'expanded'] as FigurePresentationSize[]) {
      await act(async () => root.render(<FigurePlayer figure={figure} presentationSize={size} reducedMotion />));
      const svg = host.querySelector<SVGSVGElement>('svg[data-conceptmotion]')!;
      expect(host.querySelector('figure')?.dataset.presentationSize).toBe(size);
      expect(svg).not.toBeNull();
      expect(host.querySelector('.dp-figure-player__caption')?.textContent).toBe('Inspect the first value.');
      heights.push(Number(svg.getAttribute('viewBox')?.split(' ')[3]));
      const frozen = freezeSvgElement(svg);
      expect(freezeSvgElement(svg)).toBe(frozen);
      expect(frozen).toContain('value = values[index]');
      expect(frozen).toContain('first'); expect(frozen).toContain('second');
      await act(async () => host.querySelector<HTMLButtonElement>('button[aria-label="Next"]')?.click());
      expect(Number(svg.getAttribute('viewBox')?.split(' ')[3])).toBe(heights.at(-1));
      expect(host.querySelector('[data-frame-index]')?.getAttribute('data-frame-index')).toBe('1');
      expect(host.querySelector('.dp-figure-player__caption')?.textContent).toBe('Inspect the second value.');
      await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent === 'Reset')?.click());
      expect(freezeSvgElement(svg)).toBe(frozen);
    }
    expect(heights[0]).toBeLessThan(heights[1]); expect(heights[1]).toBeLessThan(heights[2]);
    expect(JSON.stringify(figure)).toBe(original);
    await act(async () => root.render(<FigurePlayer figure={figure} reducedMotion />));
    expect(host.querySelector('svg[data-conceptmotion]')?.getAttribute('viewBox')).toBe('0 0 960 540');
    await act(async () => root.unmount());
  });

  it('shows a human selection label and keeps its stable ID in optional inspection', async () => {
    const host = mountHost(); const root = createRoot(host);
    const graph: FigureSpec = { ...figure, rendererId: 'diagram.flow', spec: { kind: 'diagram', version: '3', id: 'graph', title: 'Flow', nodes: [{ id: 'node.internal', label: 'Warehouse' }], edges: [] } };
    await act(async () => root.render(<FigurePlayer figure={graph} reducedMotion />));
    await act(async () => host.querySelector('[data-node-id="node.internal"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    expect(host.querySelector('.dp-figure-player__selection')?.textContent).toBe('Selected: Warehouse');
    const details = [...host.querySelectorAll<HTMLDetailsElement>('.dp-content-details')].find(item => item.textContent?.includes('Selected: node.internal'));
    expect(details).toBeDefined(); expect(details?.open).toBe(false);
    await act(async () => root.unmount());
  });
});
