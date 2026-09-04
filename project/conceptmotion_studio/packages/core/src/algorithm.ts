import { createSemanticSnapshot, type EntitySnapshot, type SemanticSnapshot } from './entities';
import type { LocalizedText } from './localization';

export interface LoopItem {
  readonly id: string;
  readonly label?: LocalizedText;
  readonly value: unknown;
}

export interface CodeLine {
  readonly id: string;
  readonly text: string;
}

export interface LoopFrame {
  readonly id: string;
  readonly iteration: number;
  readonly pointerItemId?: string;
  readonly activeItemIds?: readonly string[];
  readonly doneItemIds?: readonly string[];
  readonly order?: readonly string[];
  readonly variables?: Readonly<Record<string, unknown>>;
  readonly codeLineIds: readonly string[];
  readonly operation: string;
  readonly caption: LocalizedText;
}

export interface LoopSceneSpec {
  readonly kind: 'loop';
  readonly version: string;
  readonly id: string;
  readonly title: LocalizedText;
  readonly items: readonly LoopItem[];
  readonly codeLines: readonly CodeLine[];
  readonly frames: readonly LoopFrame[];
}

export interface CompiledLoopFrame {
  readonly sceneId: string;
  readonly index: number;
  readonly frame: LoopFrame;
  readonly itemOrder: readonly string[];
  readonly variables: Readonly<Record<string, unknown>>;
  readonly snapshot: SemanticSnapshot;
}

function resolveFrameIndex<T extends { readonly id: string }>(frames: readonly T[], frame: number | string): number {
  const index = typeof frame === 'number' ? frame : frames.findIndex((candidate) => candidate.id === frame);
  if (!Number.isInteger(index) || index < 0 || index >= frames.length) throw new Error(`Unknown frame "${String(frame)}".`);
  return index;
}

export function getLoopItemEntityId(sceneId: string, itemId: string): string {
  return `${sceneId}:item:${encodeURIComponent(itemId)}`;
}

export function compileLoopFrame(spec: LoopSceneSpec, frame: number | string): CompiledLoopFrame {
  const index = resolveFrameIndex(spec.frames, frame);
  const source = spec.frames[index];
  const itemIds = spec.items.map((item) => item.id);
  const uniqueItemIds = new Set(itemIds);
  if (uniqueItemIds.size !== itemIds.length) throw new Error(`Loop scene "${spec.id}" contains duplicate item ids.`);
  const codeIds = new Set(spec.codeLines.map((line) => line.id));
  if (codeIds.size !== spec.codeLines.length) throw new Error(`Loop scene "${spec.id}" contains duplicate code line ids.`);
  const order = source.order ? [...source.order] : itemIds;
  if (order.length !== itemIds.length || new Set(order).size !== itemIds.length || order.some((id) => !uniqueItemIds.has(id))) {
    throw new Error(`Loop frame "${source.id}" order must contain every item id exactly once.`);
  }
  for (const id of [...(source.activeItemIds ?? []), ...(source.doneItemIds ?? []), source.pointerItemId].filter(Boolean)) {
    if (!uniqueItemIds.has(id!)) throw new Error(`Loop frame "${source.id}" references unknown item "${id}".`);
  }
  for (const codeLineId of source.codeLineIds) {
    if (!codeIds.has(codeLineId)) throw new Error(`Loop frame "${source.id}" references unknown code line "${codeLineId}".`);
  }
  const slotById = new Map(order.map((id, slot) => [id, slot]));
  const active = new Set(source.activeItemIds ?? []);
  const done = new Set(source.doneItemIds ?? []);
  const entities: EntitySnapshot[] = spec.items.map((item) => ({
    id: getLoopItemEntityId(spec.id, item.id),
    kind: 'mark',
    role: source.pointerItemId === item.id ? 'pointer-target' : 'loop-item',
    label: item.label,
    position: { slot: slotById.get(item.id) },
    state: done.has(item.id) ? 'done' : active.has(item.id) ? 'active' : 'idle',
    emphasized: active.has(item.id) || source.pointerItemId === item.id,
    data: { itemId: item.id, value: item.value, iteration: source.iteration }
  }));
  const variables = source.variables ?? {};
  for (const [name, value] of Object.entries(variables).sort(([left], [right]) => left.localeCompare(right))) {
    entities.push({
      id: `${spec.id}:variable:${encodeURIComponent(name)}`,
      kind: 'variable',
      label: name,
      state: 'current',
      data: { name, value }
    });
  }
  return {
    sceneId: spec.id,
    index,
    frame: source,
    itemOrder: order,
    variables,
    snapshot: createSemanticSnapshot(`${spec.id}:${source.id}`, entities, {
      iteration: source.iteration,
      codeLineIds: source.codeLineIds,
      operation: source.operation
    })
  };
}

export interface RegressionPoint {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly label?: LocalizedText;
}

export interface RegressionFrame {
  readonly id: string;
  readonly slope: number;
  readonly intercept: number;
  readonly operation: string;
  readonly caption: LocalizedText;
}

export interface RegressionSceneSpec {
  readonly kind: 'regression';
  readonly version: string;
  readonly id: string;
  readonly title: LocalizedText;
  readonly points: readonly RegressionPoint[];
  readonly frames: readonly RegressionFrame[];
}

export interface RegressionPrediction {
  readonly pointId: string;
  readonly predictedY: number;
  readonly residual: number;
}

export interface CompiledRegressionFrame {
  readonly sceneId: string;
  readonly index: number;
  readonly frame: RegressionFrame;
  readonly predictions: readonly RegressionPrediction[];
  readonly mse: number;
  readonly snapshot: SemanticSnapshot;
}

export function compileRegressionFrame(spec: RegressionSceneSpec, frame: number | string): CompiledRegressionFrame {
  const index = resolveFrameIndex(spec.frames, frame);
  const source = spec.frames[index];
  const pointIds = new Set<string>();
  for (const point of spec.points) {
    if (pointIds.has(point.id)) throw new Error(`Regression scene "${spec.id}" contains duplicate point id "${point.id}".`);
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) throw new Error(`Regression point "${point.id}" must use finite coordinates.`);
    pointIds.add(point.id);
  }
  if (!Number.isFinite(source.slope) || !Number.isFinite(source.intercept)) {
    throw new Error(`Regression frame "${source.id}" must use finite slope and intercept values.`);
  }
  const predictions = spec.points.map((point) => {
    const predictedY = source.intercept + source.slope * point.x;
    return { pointId: point.id, predictedY, residual: point.y - predictedY };
  });
  const mse = predictions.length === 0
    ? 0
    : predictions.reduce((sum, prediction) => sum + prediction.residual ** 2, 0) / predictions.length;
  const entities: EntitySnapshot[] = [];
  spec.points.forEach((point, pointIndex) => {
    const prediction = predictions[pointIndex];
    const pointEntityId = `${spec.id}:point:${encodeURIComponent(point.id)}`;
    entities.push({
      id: pointEntityId,
      kind: 'mark',
      role: 'regression-point',
      label: point.label,
      position: { x: point.x, y: point.y },
      data: { pointId: point.id, x: point.x, y: point.y }
    });
    entities.push({
      id: `${spec.id}:residual:${encodeURIComponent(point.id)}`,
      kind: 'edge',
      role: 'residual',
      parentId: pointEntityId,
      data: { pointId: point.id, x: point.x, y: point.y, predictedY: prediction.predictedY, residual: prediction.residual }
    });
  });
  entities.push({
    id: `${spec.id}:regression-line`,
    kind: 'mark',
    role: 'regression-line',
    data: { slope: source.slope, intercept: source.intercept, mse }
  });
  return {
    sceneId: spec.id,
    index,
    frame: source,
    predictions,
    mse,
    snapshot: createSemanticSnapshot(`${spec.id}:${source.id}`, entities, { operation: source.operation, mse })
  };
}
