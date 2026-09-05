import {
  compileLoopFrame,
  compileRegressionFrame,
  compileTableJoin,
  type CompiledTableState,
  type DiagramSpec,
  type EntityId,
  type LineageSpec,
  type LocalizedText,
  type LoopSceneSpec,
  type RegressionSceneSpec,
  type TableJoinSpec,
  type ExplanationTrack,
} from '@conceptmotion/core';
import { resolveSceneExplanation } from './explanation.js';

import type { DiagramRendererInput } from './renderers/diagram.js';
import type { JoinRendererInput } from './renderers/join.js';
import type { LineageRendererInput } from './renderers/lineage.js';
import type { LoopRendererInput } from './renderers/loop.js';
import type { RegressionRendererInput } from './renderers/regression.js';
import type { TableRendererInput } from './renderers/table.js';

export interface TableSvgSceneSpec {
  /** Optional moving ROWS frame, aligned one-to-one with table states. */
  readonly windowFrames?: readonly TableWindowFrame[];
  readonly explanation?: ExplanationTrack;
  readonly kind: 'table';
  readonly version: string;
  readonly id: string;
  readonly title: LocalizedText;
  readonly description?: LocalizedText;
  /** Core-compiled states. Surviving row IDs remain stable between frames. */
  readonly frames: readonly CompiledTableState[];
}

export interface JoinSvgSceneSpec {
  readonly explanation?: ExplanationTrack;
  readonly kind: 'join';
  readonly version: string;
  readonly id: string;
  readonly title?: LocalizedText;
  readonly description?: LocalizedText;
  readonly join: TableJoinSpec;
  /** Optional output-row reveal count per frame; omitted renders the full result. */
  readonly revealCounts?: readonly number[];
}

export interface DiagramSvgFrame {
  readonly id: string;
  readonly activeNodeIds?: readonly EntityId[];
  readonly activeEdgeIds?: readonly EntityId[];
  readonly failedNodeIds?: readonly EntityId[];
  readonly focusedGroupId?: EntityId;
}

export type DiagramSvgSceneSpec = DiagramSpec & {
  readonly frames?: readonly DiagramSvgFrame[];
};

export interface LineageSvgFrame {
  readonly id: string;
  readonly activeRelationIds?: readonly EntityId[];
}

export type LineageSvgSceneSpec = LineageSpec & {
  readonly frames?: readonly LineageSvgFrame[];
};

export type SvgSceneSpec =
  | CollectionFlowSpec
  | TableSvgSceneSpec
  | JoinSvgSceneSpec
  | LoopSceneSpec
  | RegressionSceneSpec
  | DiagramSvgSceneSpec
  | LineageSvgSceneSpec;

export type ResolvedSvgScene =
  | { rendererId: 'collection.flow'; input: CollectionRendererInput }
  | { rendererId: 'table.transform'; input: TableRendererInput }
  | { rendererId: 'table.join'; input: JoinRendererInput }
  | { rendererId: 'algorithm.loop'; input: LoopRendererInput }
  | { rendererId: 'statistics.regression'; input: RegressionRendererInput }
  | { rendererId: 'diagram.flow'; input: DiagramRendererInput }
  | { rendererId: 'lineage.model'; input: LineageRendererInput };

function indexFor(length: number, requested = 0): number {
  if (length <= 0) throw new Error('A renderable scene must contain at least one frame.');
  if (!Number.isFinite(requested)) return 0;
  return Math.max(0, Math.min(length - 1, Math.trunc(requested)));
}

export function rendererIdForScene(spec: SvgSceneSpec): ResolvedSvgScene['rendererId'] {
  if (spec.kind === 'collection') return 'collection.flow';
  if (spec.kind === 'table') return 'table.transform';
  if (spec.kind === 'join') return 'table.join';
  if (spec.kind === 'loop') return 'algorithm.loop';
  if (spec.kind === 'regression') return 'statistics.regression';
  if (spec.kind === 'diagram') return 'diagram.flow';
  return 'lineage.model';
}

/** Resolve raw adapter specs by delegating semantic compilation to @conceptmotion/core. */
export function resolveSvgScene(
  spec: SvgSceneSpec,
  frameIndex = 0,
  parameter?: number,
): ResolvedSvgScene {
  const explanation = resolveSceneExplanation(spec, frameIndex);
  if (spec.kind === 'collection') return { rendererId: 'collection.flow', input: { spec, frame: compileCollectionFrame(spec, indexFor(spec.frames.length, frameIndex)) } };
  if (spec.kind === 'table') {
    if (spec.windowFrames) {
      if (spec.windowFrames.length !== spec.frames.length) throw new Error('Window overlays must align with table frames.');
      spec.windowFrames.forEach((frame, i) => validateTableWindowFrame(spec.frames[i], frame));
    }
    return {
      rendererId: 'table.transform',
      input: {
        state: spec.frames[indexFor(spec.frames.length, frameIndex)],
        windowFrame: spec.windowFrames?.[indexFor(spec.frames.length, frameIndex)],
        explanation,
        title: spec.title,
        description: spec.description,
      },
    };
  }
  if (spec.kind === 'join') {
    const result = compileTableJoin(spec.join);
    const revealIndex = spec.revealCounts?.length ? indexFor(spec.revealCounts.length, frameIndex) : -1;
    return {
      rendererId: 'table.join',
      input: {
        spec: spec.join,
        explanation,
        result,
        revealCount: revealIndex >= 0 ? spec.revealCounts?.[revealIndex] : result.rows.length,
        title: spec.title,
        description: spec.description,
      },
    };
  }
  if (spec.kind === 'loop') {
    const index = indexFor(spec.frames.length, frameIndex);
    return {
      rendererId: 'algorithm.loop',
      input: { spec, frame: compileLoopFrame(spec, index), explanation },
    };
  }
  if (spec.kind === 'regression') {
    const index = indexFor(spec.frames.length, frameIndex);
    if (parameter === undefined) {
      return {
        rendererId: 'statistics.regression',
        input: { spec, frame: compileRegressionFrame(spec, index) },
      };
    }
    const baseFrame = spec.frames[index];
    const parameterSpec: RegressionSceneSpec = {
      ...spec,
      frames: [{ ...baseFrame, id: `${baseFrame.id}:slope:${parameter}`, slope: parameter }],
    };
    return {
      rendererId: 'statistics.regression',
      input: { spec: parameterSpec, frame: compileRegressionFrame(parameterSpec, 0) },
    };
  }
  if (spec.kind === 'diagram') {
    const frame = spec.frames?.length ? spec.frames[indexFor(spec.frames.length, frameIndex)] : undefined;
    return {
      rendererId: 'diagram.flow',
      input: {
        spec,
        activeNodeIds: frame?.activeNodeIds,
        activeEdgeIds: frame?.activeEdgeIds,
        failedNodeIds: frame?.failedNodeIds,
        focusedGroupId: frame?.focusedGroupId,
      },
    };
  }
  const frame = spec.frames?.length ? spec.frames[indexFor(spec.frames.length, frameIndex)] : undefined;
  return {
    rendererId: 'lineage.model',
    input: { spec, activeRelationIds: frame?.activeRelationIds },
  };
}
import { compileCollectionFrame, type CollectionFlowSpec } from '@conceptmotion/core';
import type { CollectionRendererInput } from './renderers/collection.js';
import { validateTableWindowFrame, type TableWindowFrame } from '@conceptmotion/core';
