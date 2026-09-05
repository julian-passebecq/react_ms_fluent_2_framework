import assert from 'node:assert/strict';
import { validateFigureSpec } from '@datapass/content';
import { storyAdapter, storyFigure } from '../src/story';

assert.equal(validateFigureSpec(storyFigure).valid, true);
assert.deepEqual(storyAdapter.validate!(storyFigure), []);
console.log('Generic Figure envelope and consumer-owned demo payload validate independently.');
