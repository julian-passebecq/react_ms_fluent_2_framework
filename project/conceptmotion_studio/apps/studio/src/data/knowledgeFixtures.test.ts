import { describe, expect, it } from 'vitest';
import { validateKnowledgeDataset } from '@datapass/knowledge';
import {
  knowledgeDataset,
  runtimeFreshness,
  runtimeImpact,
  runtimeKnowledgeEntry,
  unaffectedKnowledgeEntry,
} from './knowledgeFixtures';

describe('Knowledge Atlas fixtures', () => {
  it('validate as a source-linked local dataset', () => {
    expect(validateKnowledgeDataset(knowledgeDataset)).toMatchObject({ valid: true, issues: [] });
  });

  it('resolve impact only through stable feature IDs', () => {
    expect(runtimeImpact.knowledgeEntryIds).toEqual([runtimeKnowledgeEntry.id]);
    expect(runtimeImpact.knowledgeEntryIds).not.toContain(unaffectedKnowledgeEntry.id);
    expect(runtimeImpact.figureIds).toEqual(['figure.fabric.runtime-medallion']);
  });

  it('marks a page for review when a later local change targets its feature', () => {
    expect(runtimeFreshness).toBe('needs-review');
  });
});
