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
for (const figure of visualExplanationFigures) {
  assert.equal(validateFigureSpec(figure).valid, true, figure.id);
  const spec = figure.spec as unknown as SvgSceneSpec | WorkflowSpec;
  for (let i = 0; i < figureStepCount(figure); i++) {
    if (spec.kind === 'workflow') compileWorkflowRunFrame(spec, spec.runs![0].id, i);
    else assert.equal(resolveSvgScene(spec, i).rendererId, figure.rendererId);
    assert.ok(resolveSceneExplanation(spec, i));
  }
}
console.log('All 17 approved visual explanations passed every production semantic frame.');
import { visualExplanationFigures } from '@datapass/canonical/explanations';
import { resolveSvgScene, resolveSceneExplanation, type SvgSceneSpec } from '@conceptmotion/svg';
import { compileWorkflowRunFrame, type WorkflowSpec } from '@conceptmotion/core';
import { figureStepCount } from '@datapass/figure';
import { dataPlatformFigures } from '@datapass/canonical/data-platform';
import { validateLineageSpec, validateDiagramSpec, validateWorkflowSpec } from '@conceptmotion/core';
for (const figure of dataPlatformFigures) {
  assert.equal(validateFigureSpec(figure).valid, true, figure.id);
  const spec = figure.spec as unknown as SvgSceneSpec | WorkflowSpec;
  const result = spec.kind === 'lineage' ? validateLineageSpec(spec) : spec.kind === 'diagram' ? validateDiagramSpec(spec) : validateWorkflowSpec(spec);
  assert.equal(result.valid, true, `${figure.id}: ${JSON.stringify(result.issues)}`);
}
console.log('All 12 data-platform Figures passed production envelope and payload validators.');
