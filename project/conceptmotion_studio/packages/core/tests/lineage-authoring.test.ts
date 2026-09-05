import { describe, expect, it } from 'vitest';
import { getLineagePortId, validateLineageSpec, type LineageSpec } from '../src';

const lineage: LineageSpec = {
  kind: 'lineage', version: '4', id: 'derive', title: 'Derive', cyclePolicy: 'reject',
  assets: [{ id: 'orders', label: 'Orders', columns: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] }],
  relations: [{ id: 'derive-b', sources: [{ assetId: 'orders', columnId: 'a' }], target: { assetId: 'orders', columnId: 'b' } }],
};
const codes = (value: unknown) => validateLineageSpec(value).issues.map(issue => issue.code);

describe('lineage authoring policy in the production validator', () => {
  it('rejects endpoint cycles, preserves same-asset derivations and historical permissiveness', () => {
    expect(validateLineageSpec(lineage).valid).toBe(true);
    const reverse = { id: 'reverse', sources: [lineage.relations[0].target], target: lineage.relations[0].sources[0] };
    const cyclic = { ...lineage, relations: [...lineage.relations, reverse] };
    expect(codes(cyclic)).toEqual(['lineage.relation.cycle']);
    expect(validateLineageSpec({ ...cyclic, cyclePolicy: undefined }).valid).toBe(true);
    expect(validateLineageSpec({ ...cyclic, cyclePolicy: 'allow' }).valid).toBe(true);
    expect(codes({ ...lineage, relations: [{ ...reverse, sources: [reverse.target] }] })).toContain('lineage.relation.cycle');
    expect(validateLineageSpec({ ...lineage, relations: [lineage.relations[0], { ...lineage.relations[0], id: 'same-derivation' }] }).valid).toBe(true);
    expect(validateLineageSpec({ ...lineage, assets: [], relations: [] }).valid).toBe(true);
  });

  it('keeps namespace-safe endpoint identity and handles deep chains without recursion', () => {
    expect(getLineagePortId({ assetId: 'a:b', columnId: 'c' })).not.toBe(getLineagePortId({ assetId: 'a', columnId: 'b:c' }));
    const columns = Array.from({ length: 3000 }, (_, i) => ({ id: String(i), label: String(i) }));
    const chain: LineageSpec = { ...lineage, assets: [{ id: 'orders', label: 'Orders', columns }], relations: columns.slice(1).map((column, i) => ({ id: `edge-${i}`, sources: [{ assetId: 'orders', columnId: String(i) }], target: { assetId: 'orders', columnId: column.id } })) };
    expect(validateLineageSpec(chain).valid).toBe(true);
    expect(codes({ ...chain, relations: [...chain.relations, { id: 'cycle', sources: [{ assetId: 'orders', columnId: '2999' }], target: { assetId: 'orders', columnId: '0' } }] })).toEqual(['lineage.relation.cycle']);
  });

  it.each([
    ['duplicate asset', { ...lineage, assets: [...lineage.assets, lineage.assets[0]] }, 'lineage.asset.id.duplicate'],
    ['duplicate field', { ...lineage, assets: [{ ...lineage.assets[0], columns: [{ id: 'a', label: 'A' }, { id: 'a', label: 'Again' }] }] }, 'lineage.column.id.duplicate'],
    ['duplicate relation', { ...lineage, relations: [...lineage.relations, lineage.relations[0]] }, 'lineage.relation.id.duplicate'],
    ['dangling asset', { ...lineage, relations: [{ ...lineage.relations[0], target: { assetId: 'missing' } }] }, 'lineage.endpoint.asset.unknown'],
    ['impossible field', { ...lineage, relations: [{ ...lineage.relations[0], target: { assetId: 'orders', columnId: 'missing' } }] }, 'lineage.endpoint.column.unknown'],
    ['bad policy', { ...lineage, cyclePolicy: 'ignore' }, 'lineage.cyclePolicy.invalid'],
    ['bad layout', { ...lineage, layout: { provider: 'force' } }, 'lineage.layout.invalid'],
    ['bad direction', { ...lineage, layout: { provider: 'layered', direction: 'diagonal' } }, 'lineage.layout.invalid'],
    ['bad model', { ...lineage, assets: [{ ...lineage.assets[0], model: { kind: 'cube' } }] }, 'lineage.model.kind.invalid'],
    ['missing grain', { ...lineage, assets: [{ ...lineage.assets[0], model: { kind: 'fact' } }] }, 'lineage.model.grain.required'],
    ['empty grain', { ...lineage, assets: [{ ...lineage.assets[0], model: { kind: 'fact', grain: ' ' } }] }, 'lineage.model.grain.required'],
    ['invalid dimension grain', { ...lineage, assets: [{ ...lineage.assets[0], model: { kind: 'dimension', grain: 4 } }] }, 'lineage.model.grain.required'],
  ])('explains %s with stable issue codes', (_, value, code) => expect(codes(value)).toContain(code));

  const model: LineageSpec = {
    ...lineage, id: 'model', layout: { provider: 'layered' },
    assets: [
      { id: 'fact', label: 'Fact', model: { kind: 'fact', grain: { en: 'One row per sale', no: 'Én rad per salg' } }, columns: [{ id: 'fk', label: 'FK', role: 'fk' }] },
      { id: 'dim', label: 'Dimension', model: { kind: 'dimension' }, columns: [{ id: 'pk', label: 'PK', role: 'pk' }] },
    ],
    relations: [{ id: 'relationship', sources: [{ assetId: 'fact', columnId: 'fk' }], target: { assetId: 'dim', columnId: 'pk' }, relationship: { cardinality: 'many-to-one', filterDirection: 'dimension-to-fact' } }],
  };
  it('validates declared model semantics without treating filter propagation as lineage', () => {
    for (const filterDirection of ['dimension-to-fact', 'both', 'none']) {
      expect(validateLineageSpec({ ...model, relations: [{ ...model.relations[0], relationship: { cardinality: 'many-to-one', filterDirection } }] }).valid).toBe(true);
    }
    expect(codes({ ...model, relations: [{ ...model.relations[0], expression: 'SQL here' }] })).toContain('lineage.relationship.derivation.conflict');
    expect(codes({ ...model, relations: [{ ...model.relations[0], relationship: {} }] })).toContain('lineage.relationship.invalid');
    for (const relation of [
      { ...model.relations[0], sources: [] },
      { ...model.relations[0], sources: [null] },
      { ...model.relations[0], sources: [model.relations[0].target] },
      { ...model.relations[0], target: { assetId: 'dim' } },
      { ...model.relations[0], sources: [...model.relations[0].sources, ...model.relations[0].sources] },
    ]) expect(codes({ ...model, relations: [relation] })).toContain('lineage.relationship.endpoints.invalid');
  });
  it('returns issues for malformed JSON enum and endpoint objects without coercing them', () => {
    const object = { toString: null };
    expect(codes({ ...lineage, cyclePolicy: object, layout: { provider: 'layered', direction: object }, assets: [{ ...lineage.assets[0], model: { kind: object } }] })).toEqual(expect.arrayContaining(['lineage.cyclePolicy.invalid', 'lineage.layout.invalid', 'lineage.model.kind.invalid']));
    expect(codes({ ...model, relations: [{ ...model.relations[0], sources: [{ assetId: object }], relationship: { cardinality: 'many-to-one', filterDirection: object } }] })).toEqual(expect.arrayContaining(['lineage.endpoint.asset.required', 'lineage.relationship.invalid', 'lineage.relationship.endpoints.invalid']));
  });
});
