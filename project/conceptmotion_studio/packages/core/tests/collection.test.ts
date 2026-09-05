import { describe, expect, it } from 'vitest';
import { compileCollectionFrame, compileTableState, validateCollectionFlowSpec, validateTableWindowFrame, type CollectionFlowSpec } from '../src';

const spec: CollectionFlowSpec = { kind: 'collection', version: '4', id: 'test', title: { en: 'Move', no: 'Flytt' }, containers: [{ id: 'input', label: 'Input' }, { id: 'output', label: 'Output' }], items: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], frames: [{ id: 'read', operation: 'READ', caption: 'Read two items.', placements: [{ itemId: 'a', containerId: 'input' }, { itemId: 'b', containerId: 'input' }] }, { id: 'move', operation: 'MOVE', caption: 'Move A.', activeItemIds: ['a'], activeContainerIds: ['output'], placements: [{ itemId: 'a', containerId: 'output', annotation: { en: 'first', no: 'først' } }, { itemId: 'b', containerId: 'input' }] }] };

describe('collection membership semantics', () => {
  it('compiles stable identity, membership, load and deterministic transitions without coordinates', () => {
    expect(validateCollectionFlowSpec(spec).valid).toBe(true);
    const original = JSON.stringify(spec);
    const initial = compileCollectionFrame(spec, 0);
    const next = compileCollectionFrame(spec, 'move');
    expect(initial.loads).toEqual({ input: 2, output: 0 });
    expect(next.loads).toEqual({ input: 1, output: 1 });
    // A changes containers; B moves into the vacated first slot.
    expect(next.transition.movingIds).toEqual(['a', 'b']);
    expect(next.transition.enteringIds).toEqual([]);
    expect(next.snapshot.entities.find(e => e.id === 'a')).toMatchObject({ parentId: 'output', position: { lane: 'output', slot: 0 }, emphasized: true });
    expect(compileCollectionFrame(spec, 1)).toEqual(next);
    expect(JSON.stringify(spec)).toBe(original);
    for (const index of [-1, 0.5, NaN, 2, 'missing']) expect(() => compileCollectionFrame(spec, index)).toThrow('Unknown collection frame');
  });
  it('keeps contributors in the snapshot when a summary changes the output grain', () => {
    const grouped: CollectionFlowSpec = { ...spec, frames: [spec.frames[0], { ...spec.frames[0], id: 'collapse', summaries: [{ id: 'total', containerId: 'input', label: 'Count = 2', sourceItemIds: ['a', 'b'], collapsed: true }] }] };
    const frame = compileCollectionFrame(grouped, 1);
    expect(frame.snapshot.entities.find(e => e.id === 'a')).toMatchObject({ visible: false, data: { collapsedInto: 'total' } });
    expect(frame.snapshot.entities.find(e => e.id === 'total')?.data).toMatchObject({ sourceItemIds: ['a', 'b'] });
    expect(frame.transition.exitingIds).toEqual([]);
    expect(frame.transition.enteringIds).toEqual(['total']);
    expect(frame.loads.input).toBe(2);
  });
  it.each([
    ['wrong root', (s: any) => null],
    ['invalid header', (s: any) => ({ ...s, kind: 'spark', id: '', title: false })],
    ['empty containers', (s: any) => ({ ...s, containers: [] })],
    ['duplicate container', (s: any) => ({ ...s, containers: [...s.containers, s.containers[0]] })],
    ['duplicate item', (s: any) => ({ ...s, items: [...s.items, s.items[0]] })],
    ['identity collision', (s: any) => ({ ...s, items: [{ id: 'input', label: 'Input' }] })],
    ['empty frames', (s: any) => ({ ...s, frames: [] })],
    ['malformed frame', (s: any) => ({ ...s, frames: [null] })],
    ['duplicate frame', (s: any) => ({ ...s, frames: [s.frames[0], s.frames[0]] })],
    ['empty operation', (s: any) => { s.frames[0].operation = ''; return s; }],
    ['missing placement', (s: any) => { s.frames[0].placements.pop(); return s; }],
    ['not placements', (s: any) => { s.frames[0].placements = null; return s; }],
    ['duplicate placement', (s: any) => { s.frames[0].placements.push(s.frames[0].placements[0]); return s; }],
    ['unknown item', (s: any) => { s.frames[0].placements[0].itemId = 'ghost'; return s; }],
    ['unknown container', (s: any) => { s.frames[0].placements[0].containerId = 'ghost'; return s; }],
    ['bad annotation', (s: any) => { s.frames[0].placements[0].annotation = false; return s; }],
    ['unknown focus', (s: any) => { s.frames[0].activeItemIds = ['ghost']; return s; }],
    ['duplicate focus', (s: any) => { s.frames[0].activeContainerIds = ['input', 'input']; return s; }],
    ['summary not array', (s: any) => { s.frames[0].summaries = {}; return s; }],
    ['bad summary', (s: any) => { s.frames[0].summaries = [{ id: 'a' }]; return s; }],
    ['wrong contributors', (s: any) => { s.frames[0].summaries = [{ id: 'sum', containerId: 'output', label: 'Count', sourceItemIds: ['a'] }]; return s; }],
    ['duplicate contributors', (s: any) => { s.frames[0].summaries = [{ id: 'sum', containerId: 'input', label: 'Count', sourceItemIds: ['a', 'a'] }]; return s; }],
    ['summary identity changes', (s: any) => { s.frames[0].summaries = [{ id: 'sum', containerId: 'input', label: 'Count', sourceItemIds: ['a'] }]; s.frames[1].summaries = [{ id: 'sum', containerId: 'output', label: 'Count', sourceItemIds: ['a'] }]; return s; }],
    ['bad explanation', (s: any) => ({ ...s, explanation: { steps: [] } })],
  ])('rejects %s', (_, mutate) => {
    const invalid = mutate(JSON.parse(JSON.stringify(spec)));
    expect(validateCollectionFlowSpec(invalid).valid).toBe(false);
    if (invalid) expect(() => compileCollectionFrame(invalid, 0)).toThrow();
  });
});

it('validates a ROWS overlay against visible consecutive row identities', () => {
  const state = compileTableState({ id: 'rows', columns: [{ id: 'v' }], rows: [1, 2, 3].map(v => ({ id: `r${v}`, values: { v } })) });
  expect(() => validateTableWindowFrame(state, { currentRowId: 'r2', memberRowIds: ['r1', 'r2'] })).not.toThrow();
  for (const memberRowIds of [[], ['r1', 'r1'], ['ghost'], ['r1', 'r3'], ['r2', 'r1']]) expect(() => validateTableWindowFrame(state, { currentRowId: memberRowIds.at(-1) ?? 'r1', memberRowIds })).toThrow();
  expect(() => validateTableWindowFrame(state, { currentRowId: 'r3', memberRowIds: ['r1'] })).toThrow();
});
