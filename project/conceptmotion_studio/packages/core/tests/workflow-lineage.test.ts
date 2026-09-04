import { describe, expect, it } from 'vitest';
import {
  compileWorkflowRun,
  compileWorkflowRunFrame,
  getFlowKindSemantics,
  getLineagePortId,
  getWorkflowEdgeId,
  validateDiagramSpec,
  validateLineageSpec,
  validateWorkflowSpec,
  type DiagramSpec,
  type LineageSpec,
  type WorkflowSpec
} from '../src/index';

const workflow: WorkflowSpec = {
  kind: 'workflow',
  version: '1.1',
  id: 'sales-refresh',
  title: { en: 'Sales refresh', no: 'Salgsoppdatering' },
  preset: 'airflow',
  groups: [{ id: 'etl', label: 'ETL', kind: 'task-group', childNodeIds: ['extract', 'transform'] }],
  nodes: [
    { id: 'extract', label: 'Extract', taskType: 'copy', groupId: 'etl', ports: [{ id: 'out', side: 'right' }] },
    { id: 'transform', label: 'Transform', taskType: 'sql', groupId: 'etl', ports: [{ id: 'in', side: 'left' }] },
    { id: 'publish', label: 'Publish', taskType: 'pipeline' }
  ],
  edges: [
    { id: 'extract-transform', from: 'extract', fromPortId: 'out', to: 'transform', toPortId: 'in', condition: 'success' },
    { from: 'transform', to: 'publish', condition: 'completion' }
  ],
  runs: [{
    id: 'synthetic-run',
    frames: [
      { id: 'queued', at: 0, states: { extract: { status: 'queued' } } },
      { id: 'running', at: 1, states: { extract: { status: 'running', attempt: 1 } } },
      { id: 'failed', at: 2, states: { extract: { status: 'failed', attempt: 1 } } },
      { id: 'retry', at: 3, states: { extract: { status: 'retrying', attempt: 2 } } },
      { id: 'rerun', at: 4, states: { extract: { status: 'running', attempt: 2 } } },
      { id: 'success', at: 5, states: { extract: { status: 'success', attempt: 2 }, transform: { status: 'queued' } } },
      { id: 'transforming', at: 6, states: { transform: { status: 'running' } } },
      { id: 'complete', at: 7, states: { transform: { status: 'success' }, publish: { status: 'skipped' } } }
    ]
  }]
};

describe('provider-independent workflow semantics', () => {
  it('validates references and deterministically carries declared state forward', () => {
    expect(validateWorkflowSpec(workflow)).toEqual({ valid: true, issues: [] });
    const frame = compileWorkflowRunFrame(workflow, 'synthetic-run', 'complete');
    expect(frame.states).toMatchObject({
      extract: { status: 'success', attempt: 2 },
      transform: { status: 'success' },
      publish: { status: 'skipped' }
    });
    expect(compileWorkflowRun(workflow, 'synthetic-run').map((item) => item.frameId)).toEqual([
      'queued', 'running', 'failed', 'retry', 'rerun', 'success', 'transforming', 'complete'
    ]);
    expect(getWorkflowEdgeId(workflow.edges[1])).toContain('completion');
  });

  it('rejects invalid edge, group, and run-state references with paths', () => {
    const invalid: WorkflowSpec = {
      ...workflow,
      edges: [{ id: 'bad-edge', from: 'missing', to: 'publish' }],
      groups: [{ id: 'bad-group', label: 'Bad', childNodeIds: ['missing'] }],
      runs: [{ id: 'bad-run', frames: [{ id: 'bad-frame', states: { missing: { status: 'running' } } }] }]
    };
    const result = validateWorkflowSpec(invalid);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'workflow.edge.from.unknown',
      'workflow.group.node.unknown',
      'workflow.run.state.target.unknown'
    ]));
  });

  it('rejects missing required graph arrays before declared-run compilation', () => {
    const invalid = { kind: 'workflow', version: '1.1', id: 'missing-graph', title: 'Missing graph' } as WorkflowSpec;
    const result = validateWorkflowSpec(invalid);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'workflow.nodes.required',
      'workflow.edges.required'
    ]));
    expect(() => compileWorkflowRunFrame(invalid, 'run', 0)).toThrow(/Invalid WorkflowSpec/);
  });

  it('defines non-color cues for every required flow kind', () => {
    const kinds = ['data-batch', 'data-stream', 'cdc', 'control', 'success', 'failure', 'completion', 'skip'] as const;
    const semantics = kinds.map(getFlowKindSemantics);
    expect(semantics.every((item) => item.requiresNonColorCue)).toBe(true);
    expect(new Set(semantics.map((item) => `${item.linePattern}:${item.marker}:${item.motion}`)).size).toBe(kinds.length);
  });
});

describe('diagram and column lineage contracts', () => {
  it('validates reusable diagram ports and endpoints', () => {
    const diagram: DiagramSpec = {
      kind: 'diagram', version: '1.1', id: 'flow', title: 'Flow',
      nodes: [
        { id: 'source', label: 'Source', ports: [{ id: 'out' }] },
        { id: 'target', label: 'Target', ports: [{ id: 'in' }] }
      ],
      edges: [{ id: 'source-target', from: { nodeId: 'source', portId: 'out' }, to: { nodeId: 'target', portId: 'in' }, flowKind: 'data-stream' }]
    };
    expect(validateDiagramSpec(diagram).valid).toBe(true);
  });

  it('validates stable column endpoints and optional derivation metadata', () => {
    const lineage: LineageSpec = {
      kind: 'lineage', version: '1.1', id: 'sales-columns', title: 'Sales lineage',
      assets: [
        { id: 'raw', label: 'raw.orders', columns: [{ id: 'gross', label: 'gross' }, { id: 'tax', label: 'tax' }] },
        { id: 'curated', label: 'fct_sales', columns: [{ id: 'net', label: 'net', role: 'derived' }] }
      ],
      relations: [{
        id: 'derive-net',
        sources: [{ assetId: 'raw', columnId: 'gross' }, { assetId: 'raw', columnId: 'tax' }],
        target: { assetId: 'curated', columnId: 'net' },
        derivation: 'Gross minus tax', expression: 'gross - tax', statementType: 'select', changeType: 'derive',
        sourceSpan: { sourceId: 'query.sql', start: { line: 4, column: 3 }, end: { line: 4, column: 24 } }
      }]
    };
    expect(validateLineageSpec(lineage)).toEqual({ valid: true, issues: [] });
    expect(getLineagePortId(lineage.relations[0].target)).toBe('lineage-port:curated:column:net');
    const invalid: LineageSpec = {
      ...lineage,
      relations: [{ ...lineage.relations[0], target: { assetId: 'curated', columnId: 'missing' } }]
    };
    expect(validateLineageSpec(invalid).issues[0]).toMatchObject({ code: 'lineage.endpoint.column.unknown' });
  });
});
