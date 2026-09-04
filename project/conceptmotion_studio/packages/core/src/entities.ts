import type { LocalizedText } from './localization';
import { planTransitions, type TransitionPlan } from './transitions';

export type EntityId = string;
export type EntityKind =
  | 'row'
  | 'cell'
  | 'node'
  | 'port'
  | 'edge'
  | 'group'
  | 'task'
  | 'mark'
  | 'variable'
  | 'annotation'
  | (string & {});

export interface SemanticEntity<TData extends Readonly<Record<string, unknown>> = Readonly<Record<string, unknown>>> {
  readonly id: EntityId;
  readonly kind: EntityKind;
  readonly role?: string;
  readonly label?: LocalizedText;
  readonly data?: TData;
}

export interface EntityPosition {
  readonly x?: number;
  readonly y?: number;
  readonly slot?: number;
  readonly rank?: number;
  readonly lane?: string;
}

export interface EntitySnapshot<TData extends Readonly<Record<string, unknown>> = Readonly<Record<string, unknown>>>
  extends SemanticEntity<TData> {
  readonly parentId?: EntityId;
  readonly position?: EntityPosition;
  readonly state?: string;
  readonly visible?: boolean;
  readonly emphasized?: boolean;
}

export interface SemanticSnapshot {
  readonly id: string;
  readonly entities: readonly EntitySnapshot[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export function createSemanticSnapshot(
  id: string,
  entities: readonly EntitySnapshot[],
  metadata?: Readonly<Record<string, unknown>>
): SemanticSnapshot {
  if (!id.trim()) throw new Error('Semantic snapshot id must be non-empty.');
  const seen = new Set<string>();
  for (const entity of entities) {
    if (!entity.id.trim()) throw new Error('Semantic entity id must be non-empty.');
    if (seen.has(entity.id)) throw new Error(`Duplicate semantic entity id "${entity.id}".`);
    seen.add(entity.id);
  }
  return { id, entities: [...entities], ...(metadata ? { metadata } : {}) };
}

export interface SemanticFrame<TState = unknown> {
  readonly id: string;
  readonly at?: number;
  readonly durationMs?: number;
  readonly caption?: LocalizedText;
  readonly operation?: string;
  readonly state: TState;
  readonly snapshot: SemanticSnapshot;
}

export interface SceneSpec<TData = unknown, TState = unknown> {
  readonly kind: 'scene';
  readonly version: string;
  readonly id: string;
  readonly renderer: string;
  readonly title: LocalizedText;
  readonly subtitle?: LocalizedText;
  readonly data: TData;
  readonly frames: readonly SemanticFrame<TState>[];
}

export interface CompiledSceneFrame<TState = unknown> extends SemanticFrame<TState> {
  readonly sceneId: string;
  readonly index: number;
  readonly transition: TransitionPlan;
}

export function compileSceneTimeline<TData, TState>(spec: SceneSpec<TData, TState>): readonly CompiledSceneFrame<TState>[] {
  let previous: SemanticSnapshot | undefined;
  return spec.frames.map((frame, index) => {
    const transition = planTransitions(previous, frame.snapshot);
    previous = frame.snapshot;
    return { ...frame, sceneId: spec.id, index, transition };
  });
}
