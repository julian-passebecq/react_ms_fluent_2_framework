import { describe, expect, it } from 'vitest';
import { compileTableTrace, type TableData, type TableTraceSpec } from '../src/index';

const source: TableData = {
  id: 'source',
  columns: [{ id: 'value' }],
  rows: [{ id: 'r1', values: { value: 1 } }],
};

const result: TableData = {
  id: 'result',
  columns: [{ id: 'value' }],
  rows: [{ id: 'r1', values: { value: 1 } }],
};

function valid(): TableTraceSpec {
  return {
    kind: 'table-trace',
    version: '1',
    id: 'runtime-contract',
    title: 'Runtime contract',
    views: [
      { id: 'source', role: 'input', table: source },
      { id: 'result', role: 'output', table: result },
    ],
    relations: [{
      id: 'map-row',
      kind: 'map',
      from: [{ viewId: 'source', kind: 'row', rowId: 'r1' }],
      to: [{ viewId: 'result', kind: 'row', rowId: 'r1' }],
    }],
  };
}

describe('Table Trace serialized boundary validation', () => {
  it('rejects relation kinds that are outside the six-relation grammar', () => {
    const spec = valid() as unknown as { relations: Array<Record<string, unknown>> };
    spec.relations[0].kind = 'shuffle';
    expect(() => compileTableTrace(spec as unknown as TableTraceSpec)).toThrow(/unsupported kind "shuffle"/i);
  });

  it('rejects view roles outside input/output instead of counting them as output', () => {
    const spec = valid() as unknown as { views: Array<Record<string, unknown>> };
    spec.views[1].role = 'intermediate';
    expect(() => compileTableTrace(spec as unknown as TableTraceSpec)).toThrow(/unsupported role "intermediate"/i);
  });

  it('rejects duplicate output views and duplicate relation IDs', () => {
    const tooManyOutputs: TableTraceSpec = {
      ...valid(),
      views: [
        ...valid().views,
        { id: 'extra', role: 'output', table: { ...result, id: 'extra-result' } },
      ],
    };
    expect(() => compileTableTrace(tooManyOutputs)).toThrow(/exactly one output view/i);

    const duplicateRelations: TableTraceSpec = {
      ...valid(),
      relations: [valid().relations[0], valid().relations[0]],
    };
    expect(() => compileTableTrace(duplicateRelations)).toThrow(/duplicate relation id/i);
  });

  it('rejects duplicate row membership inside a named group', () => {
    const spec: TableTraceSpec = {
      ...valid(),
      groups: [{ id: 'g1', viewId: 'source', rowIds: ['r1', 'r1'] }],
    };
    expect(() => compileTableTrace(spec)).toThrow(/duplicate row "r1"/i);
  });

  it('rejects unknown serialized reference kinds before key/entity compilation', () => {
    const spec = valid() as unknown as { relations: Array<{ from: Array<Record<string, unknown>> }> };
    spec.relations[0].from[0].kind = 'partition';
    expect(() => compileTableTrace(spec as unknown as TableTraceSpec)).toThrow(/unsupported kind "partition"/i);
  });
});
