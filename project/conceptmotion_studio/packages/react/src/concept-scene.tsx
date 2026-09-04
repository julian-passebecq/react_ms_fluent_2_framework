import {
  resolveSvgScene,
  type RenderOptions,
  type RendererRegistry,
  type SvgRenderer,
  type SvgSceneSpec,
} from '@conceptmotion/svg';
import { useMemo, type CSSProperties, type ReactNode } from 'react';

import { RendererHost } from './renderer-host.js';
import { useReducedMotion } from './use-reduced-motion.js';

export interface ConceptSceneProps {
  spec: SvgSceneSpec;
  frameIndex?: number;
  reducedMotion?: boolean;
  selectedId?: string;
  onSelect?: (entityId: string) => void;
  /** Direct slope override for regression scenes. */
  parameter?: number;
  registry?: RendererRegistry;
  options?: Omit<RenderOptions, 'reducedMotion' | 'selectedId' | 'onSelect'>;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  fallback?: ReactNode;
  onRendererReady?: (renderer: SvgRenderer<unknown> | null) => void;
}

export function ConceptScene({
  spec,
  frameIndex = 0,
  reducedMotion: explicitReducedMotion,
  selectedId,
  onSelect,
  parameter,
  registry,
  options,
  className,
  style,
  ariaLabel,
  fallback,
  onRendererReady,
}: ConceptSceneProps) {
  const reducedMotion = useReducedMotion(explicitReducedMotion);
  const resolution = useMemo(() => {
    try {
      return { scene: resolveSvgScene(spec, frameIndex, parameter), error: null as Error | null };
    } catch (caught) {
      return { scene: null, error: caught instanceof Error ? caught : new Error(String(caught)) };
    }
  }, [frameIndex, parameter, spec]);
  const renderOptions = useMemo<RenderOptions>(
    () => ({ ...options, reducedMotion, selectedId, onSelect }),
    [onSelect, options, reducedMotion, selectedId],
  );

  if (!resolution.scene) {
    return (
      <div className={className} style={style} role="alert" data-conceptmotion-error>
        {fallback ?? `Visualization unavailable: ${resolution.error?.message ?? 'Unknown scene error.'}`}
      </div>
    );
  }

  return (
    <RendererHost
      rendererId={resolution.scene.rendererId}
      input={resolution.scene.input}
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
