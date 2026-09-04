import { describe, expect, it } from 'vitest';
import { validateDiagramSpec, validateLineageSpec, validateWorkflowSpec } from '@conceptmotion/core';
import { columnLineageFixture, createPipelineDiagram, salesModelLineage, workflowFixture } from './diagramFixtures';

describe('Studio semantic fixtures', () => {
  it('keeps pipeline endpoints and flow semantics valid', () => {
    expect(validateDiagramSpec(createPipelineDiagram('cdc')).valid).toBe(true);
  });

  it('validates table and column lineage without a parser', () => {
    expect(validateLineageSpec(salesModelLineage).valid).toBe(true);
    expect(validateLineageSpec(columnLineageFixture).valid).toBe(true);
  });

  it('validates one provider-independent workflow', () => {
    expect(validateWorkflowSpec(workflowFixture)).toMatchObject({ valid: true, issues: [] });
  });
});
