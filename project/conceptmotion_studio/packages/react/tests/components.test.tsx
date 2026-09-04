import { compileTableSort, compileTableState, type TableData, type WorkflowSpec } from '@conceptmotion/core';
import type { SvgRenderer } from '@conceptmotion/svg';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConceptScene, WorkflowScene } from '../src/index.js';

const containers: HTMLElement[] = [];

afterEach(() => {
  containers.splice(0).forEach((container) => container.remove());
});

function container(): HTMLDivElement {
  const element = document.createElement('div');
  document.body.append(element);
  containers.push(element);
  return element;
}

const table: TableData = {
  id: 'people',
  columns: [{ id: 'name' }, { id: 'score' }],
  rows: [
    { id: 'ada', values: { name: 'Ada', score: 2 } },
    { id: 'grace', values: { name: 'Grace', score: 1 } },
  ],
};

describe('ConceptScene', () => {
  it('bridges React updates to one renderer instance and exposes selection/fallback', async () => {
    const host = container();
    const root = createRoot(host);
    const selected = vi.fn();
    const ready = vi.fn<(renderer: SvgRenderer<unknown> | null) => void>();
    const spec = {
      kind: 'table' as const,
      version: '1.1',
      id: 'people-scene',
      title: 'People',
      frames: [compileTableState(table), compileTableSort(table, [{ columnId: 'score' }])],
    };
    await act(async () => {
      root.render(
        <ConceptScene
          spec={spec}
          frameIndex={0}
          reducedMotion
          onSelect={selected}
          fallback={<span>People table summary</span>}
          onRendererReady={ready}
        />,
      );
    });
    const row = host.querySelector<SVGGElement>('g[data-row-id="grace"]')!;
    const renderer = ready.mock.calls.find(([value]) => value)?.[0];
    expect(renderer).toBeDefined();
    expect(host.querySelector('svg')?.getAttribute('role')).toBe('group');
    expect(host.querySelector('[data-conceptmotion-fallback]')?.textContent).toContain('People table summary');

    await act(async () => {
      root.render(
        <ConceptScene
          spec={spec}
          frameIndex={1}
          reducedMotion
          onSelect={selected}
          fallback={<span>People table summary</span>}
          onRendererReady={ready}
        />,
      );
    });
    expect(host.querySelector('g[data-row-id="grace"]')).toBe(row);
    row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(selected).toHaveBeenCalledWith('grace');
    expect(ready.mock.calls.filter(([value]) => value === renderer)).toHaveLength(1);

    await act(async () => root.unmount());
    expect(ready).toHaveBeenLastCalledWith(null);
  });
});

describe('WorkflowScene', () => {
  it('delegates deterministic run-frame compilation and renders an accessible workflow state', async () => {
    const workflow: WorkflowSpec = {
      kind: 'workflow',
      version: '1.1',
      id: 'publish-flow',
      title: 'Publish flow',
      nodes: [
        { id: 'prepare', label: 'Prepare' },
        { id: 'publish', label: 'Publish' },
      ],
      edges: [{ from: 'prepare', to: 'publish', condition: 'success' }],
      runs: [
        { id: 'run-1', frames: [{ id: 'f0', states: { prepare: { status: 'running' } } }] },
      ],
    };
    const host = container();
    const root = createRoot(host);
    await act(async () => {
      root.render(
        <WorkflowScene
          spec={workflow}
          mode="run"
          frameIndex={0}
          reducedMotion
          ariaLabel="Workflow visualization"
          fallback="Prepare is running."
        />,
      );
    });
    expect(host.querySelector('svg')?.getAttribute('aria-label')).toBe('Workflow visualization');
    expect(host.querySelector('svg')?.getAttribute('role')).toBe('img');
    expect(host.querySelector('g[data-node-id="prepare"]')?.getAttribute('data-status')).toBe('running');
    expect(host.querySelector('[data-conceptmotion-fallback]')?.textContent).toContain('Prepare is running.');
    await act(async () => root.unmount());
  });
});
