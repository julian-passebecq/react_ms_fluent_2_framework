import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FigurePlayer } from '@datapass/figure';
import { layoutDiagram } from '@conceptmotion/core';
import { projectRegistry } from '../../../content/projects';
import { projectGalaxyFigure, projectRegistryToDiagram } from './projectDiagram';

describe('Project Galaxy shared Figure presentation', () => {
  const reactTest = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previous = reactTest.IS_REACT_ACT_ENVIRONMENT;
  beforeAll(() => { reactTest.IS_REACT_ACT_ENVIRONMENT = true; });
  afterAll(() => { reactTest.IS_REACT_ACT_ENVIRONMENT = previous; });
  it('fits the canonical galaxy in all three sizes and freezes deterministically per size', async () => {
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    const figure = projectGalaxyFigure(projectRegistry, 'project.formation');
    const layout = layoutDiagram(projectRegistryToDiagram(projectRegistry)); const heights: number[] = [];
    for (const size of ['compact', 'regular', 'expanded'] as const) {
      await act(async () => root.render(<FigurePlayer figure={figure} presentationSize={size} reducedMotion showInspector={false} />));
      const svg = host.querySelector('svg[data-conceptmotion]')!;
      const [, , width, height] = svg.getAttribute('viewBox')!.split(' ').map(Number); heights.push(height);
      const scale = Math.min(width / layout.width, (height - 68) / layout.height);
      expect(layout.width * scale).toBeLessThanOrEqual(width);
      expect(58 + layout.height * scale).toBeLessThanOrEqual(height);
      const link = host.querySelector<HTMLAnchorElement>('a[download]')!;
      link.addEventListener('click', event => event.preventDefault());
      const exports: string[] = [];
      for (let attempt = 0; attempt < 2; attempt++) {
        await act(async () => link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
        exports.push(decodeURIComponent(link.href.split(',')[1]));
      }
      expect(exports[0]).toEqual(exports[1]); expect(exports[0]).toContain('hub:project.formation');
    }
    expect(heights[0]).toBeLessThanOrEqual(heights[1]); expect(heights[1]).toBeLessThanOrEqual(heights[2]);
    await act(async () => root.unmount()); host.remove();
  });
});
