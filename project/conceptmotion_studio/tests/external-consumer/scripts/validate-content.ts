import assert from 'node:assert/strict';
import { validateChallenge, validateFigureSpec, validateProjectRecord } from '@datapass/content';
import { compileLoopFrame, type LoopSceneSpec } from '@conceptmotion/core';
import { practiceItems } from '@datapass/canonical/practice';
import { figureForPracticeId } from '@datapass/canonical/visuals';
import { hasPracticeVisual } from '@datapass/canonical/visual-availability';
import { projectRegistry } from '@datapass/canonical/projects';

assert.equal(practiceItems.length, 323);
assert.equal(practiceItems.reduce((count, item) => count + item.variants.length, 0), 500);
for (const item of practiceItems) assert.equal(validateChallenge(item).valid, true, item.id);
for (const project of projectRegistry) assert.equal(validateProjectRecord(project).valid, true, project.id);
assert.equal(hasPracticeVisual('al-binary-search'), true);
const figure = figureForPracticeId('al-binary-search')!;
assert.equal(validateFigureSpec(figure).valid, true);
const loop = figure.spec as unknown as LoopSceneSpec;
for (let index = 0; index < loop.frames.length; index++) assert.doesNotThrow(() => compileLoopFrame(loop, index));
console.log('External canonical practice/projects, Figure envelope and semantic loop payload passed production validators.');
