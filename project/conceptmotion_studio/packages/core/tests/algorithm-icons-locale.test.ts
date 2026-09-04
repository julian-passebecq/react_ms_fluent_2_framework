import { describe, expect, it } from 'vitest';
import {
  compileLoopFrame,
  compileRegressionFrame,
  createIconRegistry,
  parseJson,
  resolveLocalizedText,
  serializeDeterministic,
  type LoopSceneSpec,
  type RegressionSceneSpec
} from '../src/index';

describe('algorithm and statistics semantic frames', () => {
  it('keeps loop items stable while their slots and synchronized code state change', () => {
    const spec: LoopSceneSpec = {
      kind: 'loop', version: '1.1', id: 'swap-loop', title: 'Swap loop',
      items: [{ id: 'value-8', value: 8 }, { id: 'value-2', value: 2 }],
      codeLines: [{ id: 'compare', text: 'if a > b:' }, { id: 'swap', text: 'a, b = b, a' }],
      frames: [
        { id: 'compare', iteration: 0, activeItemIds: ['value-8', 'value-2'], order: ['value-8', 'value-2'], variables: { i: 0 }, codeLineIds: ['compare'], operation: 'COMPARE', caption: 'Compare the pair.' },
        { id: 'swap', iteration: 0, activeItemIds: ['value-8', 'value-2'], doneItemIds: ['value-8'], order: ['value-2', 'value-8'], variables: { i: 0 }, codeLineIds: ['swap'], operation: 'SWAP', caption: 'The same values exchange slots.' }
      ]
    };
    const before = compileLoopFrame(spec, 'compare');
    const after = compileLoopFrame(spec, 'swap');
    expect(before.snapshot.entities.filter((entity) => entity.role === 'loop-item').map((entity) => entity.id))
      .toEqual(after.snapshot.entities.filter((entity) => entity.role === 'loop-item').map((entity) => entity.id));
    expect(after.itemOrder).toEqual(['value-2', 'value-8']);
  });

  it('compiles deterministic regression predictions and residual error', () => {
    const spec: RegressionSceneSpec = {
      kind: 'regression', version: '1.1', id: 'line-fit', title: 'Fit a line',
      points: [{ id: 'p1', x: 0, y: 1 }, { id: 'p2', x: 2, y: 5 }],
      frames: [{ id: 'fit', slope: 2, intercept: 1, operation: 'FIT', caption: 'The line fits both points.' }]
    };
    const frame = compileRegressionFrame(spec, 0);
    expect(frame.predictions.map((prediction) => prediction.predictedY)).toEqual([1, 5]);
    expect(frame.mse).toBe(0);
  });
});

describe('locale, icons, and serialization', () => {
  it('uses requested locale then English fallback while preserving plain strings', () => {
    expect(resolveLocalizedText({ en: 'Source', no: 'Kilde' }, 'no')).toBe('Kilde');
    expect(resolveLocalizedText({ en: 'Source' }, 'no')).toBe('Source');
    expect(resolveLocalizedText('SQL', 'no')).toBe('SQL');
    expect(resolveLocalizedText({}, 'no')).toBe('');
  });

  it('resolves missing and cyclic icons through a safe generic fallback', () => {
    const registry = createIconRegistry([
      { id: 'fabric.lakehouse', label: 'Lakehouse', fallbackId: 'generic.database' },
      { id: 'cycle.a', label: 'A', fallbackId: 'cycle.b' },
      { id: 'cycle.b', label: 'B', fallbackId: 'cycle.a' }
    ]);
    expect(registry.resolve('fabric.lakehouse')).toMatchObject({ requestedId: 'fabric.lakehouse', resolvedId: 'generic.database', usedFallback: true });
    expect(registry.resolve('powerbi.semantic-model')).toMatchObject({ resolvedId: 'generic.table', usedFallback: true });
    expect(registry.resolve('not.registered')).toMatchObject({ resolvedId: 'generic.unknown', usedFallback: true });
    expect(registry.resolve('cycle.a')).toMatchObject({ resolvedId: 'generic.unknown', usedFallback: true });
  });

  it('serializes object keys deterministically and rejects malformed JSON', () => {
    expect(serializeDeterministic({ z: 1, a: { y: 2, b: 3 } }, 0)).toBe('{"a":{"b":3,"y":2},"z":1}');
    expect(parseJson<{ ok: boolean }>('{"ok":true}')).toEqual({ ok: true });
    expect(() => parseJson('{oops')).toThrow(/Invalid JSON/);
  });
});
