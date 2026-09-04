/**
 * Pure validation helpers for the next generator families.
 * Keep these independent of React/D3 so AI-authored specs can be checked in CI,
 * notebooks, or future CLI tooling before any SVG is created.
 */

const isObject = (value) => value != null && typeof value === 'object' && !Array.isArray(value);
const nonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

function assertBase(spec, kind) {
  if (!isObject(spec)) throw new Error(`${kind} spec must be an object.`);
  if (spec.kind !== kind) throw new Error(`Expected kind "${kind}", got "${spec.kind ?? ''}".`);
  return spec;
}

function uniqueIds(items, label) {
  const seen = new Set();
  for (const item of items || []) {
    if (!nonEmptyString(item?.id)) throw new Error(`${label} item is missing a non-empty id.`);
    if (seen.has(item.id)) throw new Error(`${label} contains duplicate id "${item.id}".`);
    seen.add(item.id);
  }
  return seen;
}

export function validateCloudDiagramSpec(spec) {
  assertBase(spec, 'cloud-diagram');
  if (!Array.isArray(spec.nodes) || spec.nodes.length === 0) throw new Error('cloud-diagram requires nodes[].');
  if (!Array.isArray(spec.edges)) throw new Error('cloud-diagram requires edges[].');
  const nodeIds = uniqueIds(spec.nodes, 'nodes');
  const containerIds = uniqueIds(spec.containers || [], 'containers');

  for (const node of spec.nodes) {
    if (!nonEmptyString(node.label)) throw new Error(`cloud node ${node.id} is missing label.`);
    if (node.container && !containerIds.has(node.container)) throw new Error(`cloud node ${node.id} references unknown container ${node.container}.`);
  }
  for (const edge of spec.edges) {
    if (!nodeIds.has(edge?.from)) throw new Error(`cloud edge references unknown source ${edge?.from}.`);
    if (!nodeIds.has(edge?.to)) throw new Error(`cloud edge references unknown target ${edge?.to}.`);
    if (edge.animation && !['packets','march','pulse','none'].includes(edge.animation.type || 'none')) {
      throw new Error(`cloud edge ${edge.from}->${edge.to} has unsupported animation type ${edge.animation.type}.`);
    }
  }
  return spec;
}

export function validateDataModelSpec(spec) {
  assertBase(spec, 'data-model');
  if (!Array.isArray(spec.entities) || spec.entities.length === 0) throw new Error('data-model requires entities[].');
  if (!Array.isArray(spec.relationships)) throw new Error('data-model requires relationships[].');
  const entityIds = uniqueIds(spec.entities, 'entities');
  const fieldRefs = new Set();

  for (const entity of spec.entities) {
    if (!nonEmptyString(entity.name)) throw new Error(`entity ${entity.id} is missing name.`);
    if (!Array.isArray(entity.columns)) throw new Error(`entity ${entity.id} requires columns[].`);
    const names = new Set();
    for (const column of entity.columns) {
      if (!nonEmptyString(column?.name)) throw new Error(`entity ${entity.id} has a column without a name.`);
      if (names.has(column.name)) throw new Error(`entity ${entity.id} has duplicate column ${column.name}.`);
      names.add(column.name);
      fieldRefs.add(`${entity.id}.${column.name}`);
    }
  }

  for (const rel of spec.relationships) {
    if (!nonEmptyString(rel?.from) || !fieldRefs.has(rel.from)) throw new Error(`relationship references unknown from field ${rel?.from}.`);
    if (!nonEmptyString(rel?.to) || !fieldRefs.has(rel.to)) throw new Error(`relationship references unknown to field ${rel?.to}.`);
    if (rel.cardinality && !['one-to-one','one-to-many','many-to-one','many-to-many'].includes(rel.cardinality)) {
      throw new Error(`relationship ${rel.from}->${rel.to} has invalid cardinality ${rel.cardinality}.`);
    }
  }
  if (!entityIds.size) throw new Error('data-model has no entities.');
  return spec;
}

export function validateLineageSpec(spec) {
  assertBase(spec, 'lineage');
  if (!Array.isArray(spec.assets) || spec.assets.length === 0) throw new Error('lineage requires assets[].');
  if (!Array.isArray(spec.flows)) throw new Error('lineage requires flows[].');
  const assetIds = uniqueIds(spec.assets, 'assets');
  for (const asset of spec.assets) {
    if (!nonEmptyString(asset.label)) throw new Error(`lineage asset ${asset.id} is missing label.`);
  }
  for (const flow of spec.flows) {
    if (!assetIds.has(flow?.from)) throw new Error(`lineage flow references unknown source ${flow?.from}.`);
    if (!assetIds.has(flow?.to)) throw new Error(`lineage flow references unknown target ${flow?.to}.`);
  }
  return spec;
}

export function validateGeneratorSpec(spec) {
  switch (spec?.kind) {
    case 'cloud-diagram': return validateCloudDiagramSpec(spec);
    case 'data-model': return validateDataModelSpec(spec);
    case 'lineage': return validateLineageSpec(spec);
    default: throw new Error(`Unknown generator spec kind "${spec?.kind ?? ''}".`);
  }
}
