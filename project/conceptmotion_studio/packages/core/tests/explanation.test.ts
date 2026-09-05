import { describe, expect, it } from 'vitest';
import { resolveExplanationStep, validateExplanationTrack, type ExplanationTrack } from '../src/explanation';

const track: ExplanationTrack = { codeLines: [{ id: 'keep', text: 'keep matching rows' }], steps: [{ id: 'filtered', title: 'Keep a row', focus: { entityIds: ['row-a'], codeRefs: ['keep'], stateKeys: ['count'] }, state: [{ key: 'count', label: 'Rows', value: 1 }] }] };
const context = { entityIds: ['row-a'], frameCount: 1 };
describe('semantic explanation contracts', () => {
  it('resolves stable references deterministically without mutating content', () => {
    const bytes = JSON.stringify(track);
    expect(validateExplanationTrack(track, context).valid).toBe(true);
    expect(resolveExplanationStep(track, 20, context)?.step.id).toBe('filtered');
    expect(resolveExplanationStep(track, NaN, context)).toEqual(resolveExplanationStep(track, -1, context));
    expect(JSON.stringify(track)).toBe(bytes);
    expect(resolveExplanationStep(undefined, 0, context)).toBeUndefined();
  });
  it('reuses native code lines, rejecting unknown or duplicated references', () => {
    const native = { ...track, codeLines: undefined };
    expect(validateExplanationTrack(native, { ...context, codeLines: track.codeLines }).valid).toBe(true);
    for (const key of ['entityIds', 'stateKeys', 'codeRefs']) {
      for (const refs of [['unknown'], ['row-a', 'row-a'], 'bad']) {
        const value = { ...track, steps: [{ ...track.steps[0], focus: { [key]: refs } }] };
        expect(validateExplanationTrack(value, context).valid).toBe(false);
      }
    }
    expect(() => resolveExplanationStep(native, 0, context)).toThrow(/references/);
  });
  it('rejects malformed tracks, state, counts, labels and duplicate identifiers', () => {
    const bad = [null, {}, { steps: [] }, { ...track, codeLines: 'bad' }, { ...track, codeLines: [{ id: 'keep', text: 1 }] }, { ...track, codeLines: [track.codeLines![0], track.codeLines![0]] }, { ...track, steps: [null] }, { ...track, steps: [{ ...track.steps[0], id: '' }] }, { ...track, steps: [{ ...track.steps[0], title: 5 }] }, { ...track, steps: [{ ...track.steps[0], focus: null }] }, { ...track, steps: [{ ...track.steps[0], state: {} }] }, { ...track, steps: [{ ...track.steps[0], state: [{ key: 'count', label: 'Count', value: Infinity }] }] }, { ...track, steps: [{ ...track.steps[0], state: [{ key: 'count', label: 'Count', value: [] }] }] }, { ...track, steps: [{ ...track.steps[0], state: [track.steps[0].state![0], track.steps[0].state![0]] }] }];
    for (const value of bad) expect(validateExplanationTrack(value, context).valid).toBe(false);
    expect(validateExplanationTrack({ ...track, steps: [track.steps[0], track.steps[0]] }, { ...context, frameCount: 2 }).valid).toBe(false);
    expect(validateExplanationTrack({ steps: [{ id: 'empty', title: 'No focus', focus: {} }] }, context).valid).toBe(true);
  });
});
