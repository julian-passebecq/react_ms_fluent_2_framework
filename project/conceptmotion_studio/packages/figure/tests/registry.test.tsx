import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import type { FigureSpec } from '@datapass/content';

import { createDefaultFigureRendererRegistry, FigureRendererRegistry, FigureView } from '../src/index.js';

const containers: HTMLElement[] = [];

afterEach(() => {
  containers.splice(0).forEach((element) => element.remove());
});

function host(): HTMLDivElement {
  const element = document.createElement('div');
  document.body.append(element);
  containers.push(element);
  return element;
}

const staticFigure: FigureSpec = {
  id: 'figure-static-contract',
  kind: 'static',
  rendererId: 'static.text',
  title: { en: 'Static contract', no: 'Statisk kontrakt' },
  spec: { text: 'source -> lesson -> learner' },
  fallbackText: 'A text-only dependency flow.',
  sourceIds: ['source.fixture'],
};

describe('FigureRendererRegistry', () => {
  it('registers all ConceptMotion families and safe static adapters', () => {
    expect(createDefaultFigureRendererRegistry().ids()).toEqual([
      'algorithm.loop',
      'diagram.flow',
      'lineage.model',
      'static.image',
      'static.text',
      'statistics.regression',
      'table.join',
      'table.transform',
      'workflow.run',
      'workflow.topology',
    ]);
  });

  it('rejects duplicate adapter IDs', () => {
    const registry = new FigureRendererRegistry().register({ id: 'one', render: () => null });
    expect(() => registry.register({ id: 'one', render: () => null })).toThrow(/already registered/);
  });
});

describe('FigureView', () => {
  it('keeps FigureFrame chrome while resolving localized, serializable content', async () => {
    const element = host();
    const root = createRoot(element);
    await act(async () => root.render(<FigureView figure={staticFigure} locale="no" reducedMotion />));
    expect(element.querySelector('figure')?.getAttribute('data-figure-id')).toBe(staticFigure.id);
    expect(element.querySelector('h2')?.textContent).toBe('Statisk kontrakt');
    expect(element.querySelector('[data-figure-static="text"]')?.textContent).toContain('source -> lesson');
    expect(element.textContent).toContain('Source IDs: source.fixture');
    await act(async () => root.unmount());
  });

  it('renders accessible fallback and a structured error for an unknown adapter', async () => {
    const element = host();
    const root = createRoot(element);
    const figure = { ...staticFigure, id: 'missing', rendererId: 'future.chart' };
    await act(async () => root.render(<FigureView figure={figure} />));
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('No adapter is registered');
    expect(element.textContent).toContain('A text-only dependency flow.');
    await act(async () => root.unmount());
  });

  it('uses the declared reduced-motion state unless a frame is explicitly selected', async () => {
    const element = host();
    const root = createRoot(element);
    const registry = new FigureRendererRegistry().register({
      id: 'test.state',
      render: ({ frameIndex }) => <output data-frame-index={frameIndex}>{frameIndex}</output>,
    });
    const figure = { ...staticFigure, rendererId: 'test.state', staticState: 1, reducedMotionState: 3 };
    await act(async () => root.render(<FigureView figure={figure} registry={registry} reducedMotion />));
    expect(element.querySelector('output')?.getAttribute('data-frame-index')).toBe('3');
    await act(async () => root.render(<FigureView figure={figure} registry={registry} reducedMotion frameIndex={2} />));
    expect(element.querySelector('output')?.getAttribute('data-frame-index')).toBe('2');
    await act(async () => root.unmount());
  });

  it('rejects active or traversing static image sources', () => {
    const adapter = createDefaultFigureRendererRegistry().get('static.image');
    const imageFigure = (src: string): FigureSpec => ({
      ...staticFigure,
      id: `image-${src}`,
      rendererId: 'static.image',
      spec: { src },
    });
    expect(adapter?.validate?.(imageFigure('../secret.png'))).not.toEqual([]);
    expect(adapter?.validate?.(imageFigure('data:image/svg+xml;base64,PHN2Zz4='))).not.toEqual([]);
    expect(adapter?.validate?.(imageFigure('https://user:secret@example.com/image.png'))).not.toEqual([]);
    expect(adapter?.validate?.(imageFigure('/assets/figure.png'))).toEqual([]);
    expect(adapter?.validate?.(imageFigure('data:image/png;base64,iVBORw0KGgo='))).toEqual([]);
  });

  it('does not render unchecked legacy optional status payloads as React children', async () => {
    const element = host(); const root = createRoot(element);
    const figure = { ...staticFigure, status: { legacyExtension: true } } as unknown as FigureSpec;
    await act(async () => root.render(<FigureView figure={figure} metadataMode="developer" />));
    expect(element.querySelector('[data-figure-static="text"]')?.textContent).toContain('source -> lesson');
    expect(element.textContent).not.toContain('Status:');
    await act(async () => root.unmount());
  });
});
