import { describe, expect, it } from 'vitest';
import { practiceCatalog, practiceItems, practiceItemById } from '@datapass/canonical/practice';
import { migratedVisuals, migratedFigures, figureForPracticeId } from '@datapass/canonical/visuals';
import { hasPracticeVisual, visualPracticeIds } from '@datapass/canonical/visual-availability';
import { projectRegistry } from '@datapass/canonical/projects';
import { dataPlatformFigures } from '@datapass/canonical/data-platform';
import { practiceCatalog as originalPractice } from './practice';
import { migratedVisuals as originalVisuals } from './visuals';
import { projectRegistry as originalProjects } from './projects';
import manifest from './package.json';

describe('portable read-only canonical entrypoints', () => {
  it('exports the original shared identities without regenerating or duplicating data', () => {
    expect(practiceCatalog).toBe(originalPractice);
    expect(migratedVisuals).toBe(originalVisuals);
    expect(projectRegistry).toBe(originalProjects);
    expect(practiceItems).toHaveLength(323);
    expect(practiceItems.reduce((total, item) => total + item.variants.length, 0)).toBe(500);
    expect(migratedFigures).toHaveLength(30);
    expect(projectRegistry).toHaveLength(10);
    expect(dataPlatformFigures).toHaveLength(12);
    for (const entry of migratedVisuals) for (const id of entry.practiceIds) {
      expect(practiceItemById(id)?.id).toBe(id);
      expect(hasPracticeVisual(id)).toBe(true);
      expect(figureForPracticeId(id)).toBeDefined();
    }
    expect([...new Set(migratedVisuals.flatMap(entry => entry.practiceIds))].sort()).toEqual([...visualPracticeIds].sort());
  });
  it('has six explicit exports and pure semantic dependencies', () => {
    expect(Object.keys(manifest.exports).sort()).toEqual(['./data-platform', './explanations', './practice', './projects', './visual-availability', './visuals']);
    expect(Object.keys(manifest.dependencies).sort()).toEqual(['@conceptmotion/core', '@datapass/content']);
    expect(manifest.sideEffects).toBe(false);
    expect(Object.values(manifest.exports).join(' ')).not.toMatch(/snapshot|catalog\.json|private/);
  });
});
