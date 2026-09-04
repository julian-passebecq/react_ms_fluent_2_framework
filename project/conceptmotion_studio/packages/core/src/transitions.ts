import type { EntitySnapshot, SemanticSnapshot } from './entities';
import { serializeDeterministic } from './serialization';

export type TransitionKind = 'enter' | 'update' | 'move' | 'emphasize' | 'de-emphasize' | 'exit';
export type TransitionChange =
  | 'kind'
  | 'role'
  | 'label'
  | 'parent'
  | 'position'
  | 'state'
  | 'visibility'
  | 'emphasis'
  | 'data';

export interface TransitionPlanItem {
  readonly entityId: string;
  readonly kind: TransitionKind;
  readonly changes: readonly TransitionChange[];
  readonly before?: EntitySnapshot;
  readonly after?: EntitySnapshot;
}

export interface TransitionPlan {
  readonly fromSnapshotId?: string;
  readonly toSnapshotId: string;
  readonly items: readonly TransitionPlanItem[];
  readonly enteringIds: readonly string[];
  readonly movingIds: readonly string[];
  readonly exitingIds: readonly string[];
}

function same(left: unknown, right: unknown): boolean {
  if (left === undefined || right === undefined) return left === right;
  return serializeDeterministic(left, 0) === serializeDeterministic(right, 0);
}

function changedFields(before: EntitySnapshot, after: EntitySnapshot): TransitionChange[] {
  const changes: TransitionChange[] = [];
  if (before.kind !== after.kind) changes.push('kind');
  if (before.role !== after.role) changes.push('role');
  if (!same(before.label, after.label)) changes.push('label');
  if (before.parentId !== after.parentId) changes.push('parent');
  if (!same(before.position, after.position)) changes.push('position');
  if (before.state !== after.state) changes.push('state');
  if ((before.visible ?? true) !== (after.visible ?? true)) changes.push('visibility');
  if ((before.emphasized ?? false) !== (after.emphasized ?? false)) changes.push('emphasis');
  if (!same(before.data, after.data)) changes.push('data');
  return changes;
}

function primaryKind(before: EntitySnapshot, after: EntitySnapshot, changes: readonly TransitionChange[]): TransitionKind {
  if (changes.includes('position')) return 'move';
  if (changes.includes('emphasis')) return after.emphasized ? 'emphasize' : 'de-emphasize';
  return 'update';
}

export function planTransitions(previous: SemanticSnapshot | undefined, next: SemanticSnapshot): TransitionPlan {
  const beforeById = new Map((previous?.entities ?? []).map((entity) => [entity.id, entity]));
  const afterById = new Map(next.entities.map((entity) => [entity.id, entity]));
  const ids = [...new Set([...beforeById.keys(), ...afterById.keys()])].sort((left, right) => left.localeCompare(right));
  const items: TransitionPlanItem[] = [];

  for (const id of ids) {
    const before = beforeById.get(id);
    const after = afterById.get(id);
    if (!before && after) {
      items.push({ entityId: id, kind: 'enter', changes: [], after });
      continue;
    }
    if (before && !after) {
      items.push({ entityId: id, kind: 'exit', changes: [], before });
      continue;
    }
    if (!before || !after) continue;
    const changes = changedFields(before, after);
    if (changes.length > 0) items.push({ entityId: id, kind: primaryKind(before, after, changes), changes, before, after });
  }

  return {
    ...(previous ? { fromSnapshotId: previous.id } : {}),
    toSnapshotId: next.id,
    items,
    enteringIds: items.filter((item) => item.kind === 'enter').map((item) => item.entityId),
    movingIds: items.filter((item) => item.kind === 'move').map((item) => item.entityId),
    exitingIds: items.filter((item) => item.kind === 'exit').map((item) => item.entityId)
  };
}
