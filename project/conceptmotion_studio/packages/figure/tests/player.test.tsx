import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import type { FigureSpec } from '@datapass/content';
import { freezeSvgElement } from '@conceptmotion/svg';
import { FigurePlayer, figureStepCount } from '../src';

const figure: FigureSpec = { id: 'player', kind: 'diagram', rendererId: 'diagram.flow', title: 'Player fixture', fallbackText: 'A flows to B.', spec: { kind: 'diagram', version: '3', id: 'player', title: 'Player fixture', nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], edges: [{ id: 'ab', from: { nodeId: 'a' }, to: { nodeId: 'b' } }], frames: [{ id: 'one', activeNodeIds: ['a'] }, { id: 'two', activeNodeIds: ['b'] }] } };
describe('FigurePlayer', () => {
  it('infers scene lengths without forcing playback onto static content', () => {
    expect(figureStepCount(figure)).toBe(2);
    expect(figureStepCount({ ...figure, spec: { revealCounts: [0, 1, 2] } })).toBe(3);
    expect(figureStepCount({ ...figure, spec: { runs: [{ frames: [{ id: 'f' }] }] } })).toBe(1);
    expect(figureStepCount({ ...figure, spec: null })).toBe(1);
  });
  it('supports steps, semantic selection and reset under reduced motion', async () => {
    const container = document.createElement('div'); document.body.append(container); const root = createRoot(container);
    await act(async () => root.render(<FigurePlayer figure={figure} captions={['First', 'Second']} reducedMotion />));
    expect(container.querySelector('button[aria-label^="Play unavailable"]')?.hasAttribute('disabled')).toBe(true);
    await act(async () => (container.querySelector('button[aria-label="Next"]') as HTMLButtonElement).click());
    expect(container.querySelector('[data-frame-index]')?.getAttribute('data-frame-index')).toBe('1');
    expect(container.textContent).toContain('Second');
    await act(async () => { container.querySelector<SVGElement>('[data-node-id="b"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
    expect(container.textContent).toContain('Selected: b');
    await act(async () => { [...container.querySelectorAll('button')].find(b => b.textContent === 'Reset')?.click(); });
    expect(container.querySelector('[data-frame-index]')?.getAttribute('data-frame-index')).toBe('0');
    expect(container.querySelector('a[download]')?.getAttribute('download')).toBe('player.svg');
    await act(async () => root.unmount()); container.remove();
  });
  it('does not advertise SVG export for an unknown adapter', async () => {
    const container = document.createElement('div'); const root = createRoot(container);
    await act(async () => root.render(<FigurePlayer figure={{ ...figure, rendererId: 'future.chart' }} reducedMotion />));
    expect(container.querySelector('a[download]')).toBeNull();
    expect(container.textContent).toContain('SVG export unavailable');
    expect(container.textContent).toContain('No adapter is registered');
    expect(container.querySelector('button[aria-label="Next"]')).toBeNull();
    await act(async () => root.unmount());
  });
  it('namespaces two same-family live figures while preserving deterministic SVG exports', async () => {
    const container = document.createElement('div'); document.body.append(container); const root = createRoot(container);
    await act(async () => root.render(<><FigurePlayer figure={figure} reducedMotion /><FigurePlayer figure={{ ...figure, id: 'player-copy' }} reducedMotion /></>));
    const svgs = [...container.querySelectorAll<SVGSVGElement>('svg[data-conceptmotion]')];
    expect(svgs).toHaveLength(2);
    const references = svgs.map(svg => svg.getAttribute('aria-labelledby')!.split(' '));
    expect(references[0]).not.toEqual(references[1]);
    for (const [index, ids] of references.entries()) for (const id of ids) expect(svgs[index].contains(document.getElementById(id))).toBe(true);
    const frozen = svgs.map(svg => freezeSvgElement(svg));
    expect(frozen[0]).toBe(frozen[1]);
    expect(frozen[0]).not.toContain('data-figure-player-a11y');
    expect(frozen[0]).toContain('cm-diagram-title');
    await act(async () => root.unmount()); container.remove();
  });
});
