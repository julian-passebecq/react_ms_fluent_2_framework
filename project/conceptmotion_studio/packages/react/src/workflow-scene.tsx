import type { WorkflowPreset, WorkflowSpec } from '@conceptmotion/core';
import {
  resolveWorkflowRendererInput,
  type RenderOptions,
  type RendererRegistry,
  type SvgRenderer,
  type WorkflowRendererInput,
  type WorkflowRenderMode,
} from '@conceptmotion/svg';
import { useMemo, type CSSProperties, type ReactNode } from 'react';

import { RendererHost } from './renderer-host.js';
import { useReducedMotion } from './use-reduced-motion.js';

export interface WorkflowSceneProps {
  spec: WorkflowSpec;
  frameIndex?: number;
  runId?: string;
  mode?: WorkflowRenderMode;
  focusedGroupId?: string;
  selectedId?: string;
  onSelect?: (entityId: string) => void;
  preset?: WorkflowPreset;
  reducedMotion?: boolean;
  registry?: RendererRegistry;
  options?: Omit<RenderOptions, 'reducedMotion' | 'selectedId' | 'onSelect'>;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  fallback?: ReactNode;
  onRendererReady?: (renderer: SvgRenderer<WorkflowRendererInput> | null) => void;
}

export function WorkflowScene({
  spec,
  frameIndex = 0,
  runId,
  mode = 'topology',
  focusedGroupId,
  selectedId,
  onSelect,
  preset,
  reducedMotion: explicitReducedMotion,
  registry,
  options,
  className,
  style,
  ariaLabel,
  fallback,
  onRendererReady,
}: WorkflowSceneProps) {
  const reducedMotion = useReducedMotion(explicitReducedMotion);
  const selectedRunId = runId ?? spec.runs?.[0]?.id;
  const resolution = useMemo(() => {
    try {
      const input = resolveWorkflowRendererInput(spec, {
        frameIndex,
        runId: selectedRunId,
        mode,
        focusedGroupId,
        preset,
      });
      return { input, error: null as Error | null };
    } catch (caught) {
      return { input: null, error: caught instanceof Error ? caught : new Error(String(caught)) };
    }
  }, [focusedGroupId, frameIndex, mode, preset, selectedRunId, spec]);
  const renderOptions = useMemo<RenderOptions>(
    () => ({ ...options, reducedMotion, selectedId, onSelect }),
    [onSelect, options, reducedMotion, selectedId],
  );

  if (!resolution.input) {
    return (
      <div className={className} style={style} role="alert" data-conceptmotion-error>
        {fallback ?? `Workflow unavailable: ${resolution.error?.message ?? 'Unknown workflow error.'}`}
      </div>
    );
  }

  return (
    <RendererHost
      rendererId="workflow.topology"
      input={resolution.input}
      registry={registry}
      options={renderOptions}
      className={className}
      style={style}
      ariaLabel={ariaLabel}
      fallback={fallback}
      onRendererReady={onRendererReady}
    />
  );
}
