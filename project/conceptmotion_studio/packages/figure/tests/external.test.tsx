import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import type { FigureSpec } from '@datapass/content';
import { FigurePlayer, FigureRendererRegistry, FigureView } from '../src';

const figure: FigureSpec = { id: 'external', kind: 'concept', rendererId: 'external.demo', title: 'External', fallbackText: 'Three positions.', spec: { beats: ['Start', 'Middle', 'End'] } };
const registry = new FigureRendererRegistry().register({
  id: 'external.demo',
  validate: value => value.spec === null ? ['Invalid external payload.'] : [],
  render: ({ frameIndex, reducedMotion }) => <output data-motion={String(reducedMotion)}>{frameIndex}</output>,
});

describe('external Figure playback', () => {
  it('keeps existing semantic-renderer errors out of the playback path', async () => {
    const invalidFigures: FigureSpec[] = [
      { ...figure, rendererId: 'diagram.flow', spec: { kind: 'diagram', version: '3', id: 'broken', title: 'Broken', nodes: [], edges: [{ id: 'missing', from: { nodeId: 'absent' }, to: { nodeId: 'absent' } }], frames: [{ id: 'one' }, { id: 'two' }] } },
      { ...figure, rendererId: 'collection.flow', spec: { kind: 'collection', frames: [{ id: 'one' }, { id: 'two' }] } },
    ];
    const container = document.createElement('div'); const root = createRoot(container);
    for (const invalid of invalidFigures) {
      await act(async () => root.render(<FigurePlayer figure={invalid} reducedMotion />));
      expect(container.querySelector(invalid.rendererId === 'diagram.flow' ? '[data-renderer-error="true"]' : '[data-conceptmotion-error]')).not.toBeNull();
      expect(container.querySelector('button[aria-label="Next"]')).toBeNull();
      expect(container.querySelector('a[download]')).toBeNull();
    }
    await act(async () => root.unmount());
  });

  it('steps an unrelated HTML adapter with explicit count and captions, without a ConceptMotion marker', async () => {
    const container = document.createElement('div'); document.body.append(container); const root = createRoot(container);
    const changes: number[] = [];
    await act(async () => root.render(<FigurePlayer figure={figure} registry={registry} stepCount={3} captions={['Start', 'Middle', 'End']} reducedMotion onFrameChange={frame => changes.push(frame)} />));
    const output = () => container.querySelector('output[data-motion]');
    const click = async (label: string) => act(async () => container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!.click());
    expect(output()?.textContent).toBe('0');
    expect(output()?.getAttribute('data-motion')).toBe('true');
    expect(container.querySelector('.dp-visualization-surface__renderer svg')).toBeNull();
    expect(container.querySelector('a[download]')).toBeNull();
    expect(container.querySelector('button[aria-label^="Play unavailable"]')?.hasAttribute('disabled')).toBe(true);
    await click('Next'); await click('Next');
    expect(output()?.textContent).toBe('2');
    expect(container.querySelector('.dp-figure-player__caption')?.textContent).toBe('End');
    expect(container.querySelector('button[aria-label="Next"]')?.hasAttribute('disabled')).toBe(true);
    await click('Previous');
    expect(output()?.textContent).toBe('1');
    await act(async () => [...container.querySelectorAll('button')].find(button => button.textContent === 'Reset')!.click());
    expect(output()?.textContent).toBe('0');
    expect(changes).toEqual([1, 2, 1, 0]);
    await act(async () => root.unmount()); container.remove();
  });

  it('removes controls when the same external Figure becomes invalid, then recovers', async () => {
    const container = document.createElement('div'); const root = createRoot(container);
    for (const spec of [figure.spec, null, figure.spec]) {
      await act(async () => root.render(<FigurePlayer figure={{ ...figure, spec }} registry={registry} stepCount={3} reducedMotion />));
      expect(Boolean(container.querySelector('button[aria-label="Next"]'))).toBe(spec !== null);
      expect(Boolean(container.querySelector('[role="alert"]'))).toBe(spec === null);
    }
    await act(async () => root.unmount());
  });

  it('preserves controlled frames and direct FigureView static/reduced-motion states', async () => {
    const container = document.createElement('div'); const root = createRoot(container);
    await act(async () => root.render(<FigurePlayer figure={figure} registry={registry} frameIndex={2} stepCount={3} reducedMotion />));
    expect(container.querySelector('output[data-motion]')?.textContent).toBe('2');
    await act(async () => root.render(<FigureView figure={{ ...figure, staticState: 1, reducedMotionState: 2 }} registry={registry} reducedMotion />));
    expect(container.querySelector('output')?.textContent).toBe('2');
    await act(async () => root.render(<FigureView figure={{ ...figure, staticState: 1 }} registry={registry} />));
    expect(container.querySelector('output')?.textContent).toBe('1');
    await act(async () => root.unmount());
  });

  it('turns a throwing payload validator into the same accessible fallback', async () => {
    const throwing = new FigureRendererRegistry().register({ id: 'external.demo', validate() { throw new Error('Unsupported step shape.'); }, render() { throw new Error('Must not render.'); } });
    const container = document.createElement('div'); const root = createRoot(container);
    await act(async () => root.render(<FigurePlayer figure={figure} registry={throwing} stepCount={3} reducedMotion fallbackMode="visible" />));
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Unsupported step shape.');
    expect(container.textContent).toContain('Three positions.');
    expect(container.querySelector('button[aria-label="Next"]')).toBeNull();
    await act(async () => root.unmount());
  });
});
