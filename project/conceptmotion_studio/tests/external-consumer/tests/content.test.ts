import { describe, expect, it } from 'vitest';
import { figureForPracticeId, migratedVisuals } from '@datapass/canonical/visuals';
import { hasPracticeVisual, visualPracticeIds } from '@datapass/canonical/visual-availability';
import { projectRegistry } from '@datapass/canonical/projects';
import { practiceItems, practiceItemById } from '@datapass/canonical/practice';
import { createDefaultFigureRendererRegistry, figureStepCount } from '@datapass/figure';
import { ChallengeWorkbench } from '@datapass/learning';

describe('real external package boundaries', () => {
  it('resolves canonical data through supported package exports', () => {
    expect(practiceItems).toHaveLength(323);
    expect(projectRegistry).toHaveLength(10);
    expect(migratedVisuals).toHaveLength(30);
    expect(visualPracticeIds).toHaveLength(18);
    expect(practiceItemById('al-binary-search')?.id).toBe('al-binary-search');
    expect(hasPracticeVisual('missing')).toBe(false);
    expect(figureForPracticeId('missing')).toBeUndefined();
  });
  it('loads the genuine Figure and learning stack without renderer copies or framework node_modules', () => {
    const figure = figureForPracticeId('al-binary-search')!;
    expect(figureStepCount(figure)).toBe(3);
    const adapter = createDefaultFigureRendererRegistry().get(figure.rendererId)!;
    expect(adapter.validate?.(figure)).toEqual([]);
    expect(ChallengeWorkbench).toBeTypeOf('function');
  });
});
