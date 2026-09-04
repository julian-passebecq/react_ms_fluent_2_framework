import { describe, expect, it } from 'vitest';
import {
  compileTableAction,
  isLocalizedText,
  resolveLocalizedText,
  validateDiagramSpec,
  validateLineageSpec,
  validateWorkflowSpec,
  type TableData,
  type TableJoinAction
} from '../src/index';

function codes(validation: { readonly issues: readonly { readonly code: string }[] }): readonly string[] {
  return validation.issues.map((issue) => issue.code);
}

describe('parsed JSON validation hardening', () => {
  it('requires graph and lineage collections instead of assuming them', () => {
    expect(codes(validateWorkflowSpec({ kind: 'workflow', version: '1.1', id: 'w', title: 'W' }))).toEqual(expect.arrayContaining([
      'workflow.nodes.required',
      'workflow.edges.required'
    ]));
    expect(codes(validateDiagramSpec({ kind: 'diagram', version: '1.1', id: 'd', title: 'D' }))).toEqual(expect.arrayContaining([
      'diagram.nodes.required',
      'diagram.edges.required'
    ]));
    expect(codes(validateLineageSpec({ kind: 'lineage', version: '1.1', id: 'l', title: 'L' }))).toEqual(expect.arrayContaining([
      'lineage.assets.required',
      'lineage.relations.required'
    ]));
  });

  it('returns workflow issues for malformed nested JSON without throwing', () => {
    const malformed = {
      kind: 'workflow',
      version: '1.1',
      id: 'workflow',
      title: 'Workflow',
      preset: 'unknown-provider',
      layout: { direction: 'diagonal', density: 'packed' },
      schedule: { kind: 'daily', expression: '', label: {} },
      groups: [{ id: 'shared', label: 'Group', kind: 'loop', childNodeIds: 'node' }],
      nodes: [
        { id: 'shared', label: 'Node', ports: [{ id: 'out', side: 'diagonal' }, null] },
        null
      ],
      edges: [{ id: '', from: 'shared', to: 42, condition: 'sometimes', dataFlowKind: 'teleport' }, null],
      overlays: [{ id: 'overlay', kind: 'heatmap', targetIds: ['missing'] }],
      runs: [{ id: 'run', frames: [{ id: 'frame', states: { shared: null } }] }]
    };

    expect(() => validateWorkflowSpec(malformed)).not.toThrow();
    expect(codes(validateWorkflowSpec(malformed))).toEqual(expect.arrayContaining([
      'workflow.preset.invalid',
      'workflow.layout.direction.invalid',
      'workflow.layout.density.invalid',
      'workflow.schedule.kind.invalid',
      'workflow.schedule.expression.invalid',
      'workflow.group.kind.invalid',
      'workflow.group.childNodeIds.invalid',
      'workflow.target.id.duplicate',
      'workflow.port.side.invalid',
      'workflow.port.object.invalid',
      'workflow.node.object.invalid',
      'workflow.edge.to.required',
      'workflow.edge.id.invalid',
      'workflow.edge.condition.invalid',
      'workflow.edge.dataFlowKind.invalid',
      'workflow.edge.object.invalid',
      'workflow.overlay.kind.invalid',
      'workflow.overlay.target.unknown',
      'workflow.run.state.object.invalid'
    ]));
  });

  it('returns diagram issues for malformed endpoints, layout, ports, and collisions', () => {
    const malformed = {
      kind: 'diagram',
      version: '1.1',
      id: 'diagram',
      title: 'Diagram',
      layout: { direction: 'diagonal', density: 'dense', preferredRanks: { missing: -1 }, align: [['missing']] },
      groups: [{ id: 'shared', label: 'Group' }],
      nodes: [{ id: 'shared', label: 'Node', ports: [{ id: 'out', side: 'diagonal' }] }],
      edges: [{ id: 'edge', from: null, to: { nodeId: 'shared', portId: 'missing' }, flowKind: 'teleport' }]
    };

    expect(() => validateDiagramSpec(malformed)).not.toThrow();
    expect(codes(validateDiagramSpec(malformed))).toEqual(expect.arrayContaining([
      'diagram.target.id.duplicate',
      'diagram.layout.direction.invalid',
      'diagram.layout.density.invalid',
      'diagram.layout.node.unknown',
      'diagram.layout.rank.invalid',
      'diagram.port.side.invalid',
      'diagram.edge.endpoint.invalid',
      'diagram.edge.port.unknown',
      'diagram.edge.flowKind.invalid'
    ]));
  });

  it('returns lineage issues for malformed assets, columns, relations, endpoints, and spans', () => {
    const malformed = {
      kind: 'lineage',
      version: '1.1',
      id: 'lineage',
      title: 'Lineage',
      assets: [{ id: 'asset', label: 'Asset', columns: [{ id: 'column', label: 'Column' }, null] }, null],
      relations: [{
        id: 'relation',
        sources: [null],
        target: null,
        statementType: 'delete',
        changeType: 'explode',
        sourceSpan: { start: null, end: { line: 0, column: 1 } }
      }, null]
    };

    expect(() => validateLineageSpec(malformed)).not.toThrow();
    expect(codes(validateLineageSpec(malformed))).toEqual(expect.arrayContaining([
      'lineage.asset.object.invalid',
      'lineage.column.object.invalid',
      'lineage.relation.object.invalid',
      'lineage.endpoint.object.invalid',
      'lineage.relation.statementType.invalid',
      'lineage.relation.changeType.invalid',
      'lineage.sourceSpan.start.invalid',
      'lineage.sourceSpan.end.invalid'
    ]));
  });
});

describe('localized text and table-action assumptions', () => {
  it('requires at least one non-whitespace localized string and skips whitespace fallbacks', () => {
    expect(isLocalizedText('   ')).toBe(false);
    expect(isLocalizedText({ en: '', no: '   ' })).toBe(false);
    expect(isLocalizedText({ en: 'English', no: '' })).toBe(true);
    expect(resolveLocalizedText({ en: '  ', no: 'Norsk' }, 'en')).toBe('Norsk');
    expect(resolveLocalizedText('   ')).toBe('');
  });

  it('requires a join action left table to match the supplied action target table', () => {
    const supplied: TableData = { id: 'supplied', columns: [], rows: [] };
    const other: TableData = { id: 'other', columns: [], rows: [] };
    const action: TableJoinAction = {
      id: 'join',
      action: 'join',
      joinType: 'cross',
      left: other,
      right: supplied
    };

    expect(() => compileTableAction(supplied, action)).toThrow('Join action uses left table "other", not supplied table "supplied".');
  });
});
