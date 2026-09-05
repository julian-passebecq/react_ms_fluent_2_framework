import type { WorkflowSpec } from '@conceptmotion/core';
import { ConceptScene, WorkflowScene } from '@conceptmotion/react';
import { recommendedSceneViewport, rendererIdForScene, type SvgSceneSpec } from '@conceptmotion/svg';
import type { FigureSpec, LocalizedText } from '@datapass/content';
import { ContentDetails, datapassSurfaceTokens as surfaces, FigureFrame } from '@datapass/ui';
import type { CSSProperties, ReactNode } from 'react';

/** Consumer presentation, intentionally not part of the serializable FigureSpec. */
export type FigurePresentationSize = 'compact' | 'regular' | 'expanded';
export type FigureMetadataMode = 'consumer' | 'developer';

export interface FigureRenderContext {
  figure: FigureSpec;
  locale: string;
  reducedMotion: boolean;
  presentationSize?: FigurePresentationSize;
  frameIndex?: number;
  selectedId?: string;
  onSelect?: (entityId: string) => void;
}

export interface FigureRendererAdapter {
  id: string;
  validate?: (figure: FigureSpec) => readonly string[];
  render: (context: FigureRenderContext) => ReactNode;
}

export class FigureRendererRegistry {
  readonly #adapters = new Map<string, FigureRendererAdapter>();

  register(adapter: FigureRendererAdapter): this {
    if (!adapter.id.trim()) throw new Error('A Figure renderer adapter requires a non-empty ID.');
    if (this.#adapters.has(adapter.id)) throw new Error(`Figure renderer adapter “${adapter.id}” is already registered.`);
    this.#adapters.set(adapter.id, adapter);
    return this;
  }

  replace(adapter: FigureRendererAdapter): this {
    if (!adapter.id.trim()) throw new Error('A Figure renderer adapter requires a non-empty ID.');
    this.#adapters.set(adapter.id, adapter);
    return this;
  }

  get(id: string): FigureRendererAdapter | undefined {
    return this.#adapters.get(id);
  }

  has(id: string): boolean {
    return this.#adapters.has(id);
  }

  ids(): string[] {
    return [...this.#adapters.keys()].sort();
  }
}

const conceptMotionRendererIds = [
  'collection.flow',
  'algorithm.loop',
  'diagram.flow',
  'lineage.model',
  'statistics.regression',
  'table.join',
  'table.transform',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function figureStateIndex(figure: FigureSpec, reducedMotion: boolean): number {
  const state = reducedMotion
    ? (figure.reducedMotionState ?? figure.staticState)
    : figure.staticState;
  return numericState(state);
}

/** Small opt-in editorial profile; renderer-neutral content never embeds colors. */
function figureOptions(figure: FigureSpec, locale: string, presentationSize?: FigurePresentationSize) {
  let viewport = { width: 960, height: 540 };
  if (presentationSize) {
    // Presentation must not bypass the renderer's guarded semantic resolution.
    // A malformed legacy payload still reaches its existing accessible error.
    try { viewport = recommendedSceneViewport(figure.spec as unknown as SvgSceneSpec | WorkflowSpec, presentationSize); }
    catch { /* Leave validation/error reporting to the production renderer. */ }
  }
  return {
    // Legacy callers retain the original canvas. Opt-in sizes are content-aware
    // and stable across all steps rather than dependent on the active frame.
    ...viewport,
    locale: locale === 'no' ? 'no' as const : 'en' as const,
    theme: figure.profile === 'professional' ? {
      ink: surfaces.inkPrimary, mutedInk: surfaces.inkSecondary, surface: surfaces.surfaceBase, surfaceRaised: surfaces.canvasWarm,
      accent: surfaces.accentTeal, accentSubtle: '#e9f3f1', border: surfaces.borderSubtle,
      dataBatch: surfaces.accentTeal, dataStream: surfaces.accentTeal, control: surfaces.inkSecondary, lineage: surfaces.inkSecondary, cdc: surfaces.accentAmber,
    } : undefined,
  };
}

function conceptMotionAdapter(id: string): FigureRendererAdapter {
  return {
    id,
    validate(figure) {
      try {
        const scene = figure.spec as unknown as SvgSceneSpec;
        const actual = rendererIdForScene(scene);
        return actual === id ? [] : [`Figure declares renderer “${id}” but its scene resolves to “${actual}”.`];
      } catch (error) {
        return [error instanceof Error ? error.message : String(error)];
      }
    },
    render({ figure, frameIndex, locale, onSelect, reducedMotion, selectedId, presentationSize }) {
      return (
        <ConceptScene
          spec={figure.spec as unknown as SvgSceneSpec}
          frameIndex={frameIndex ?? figureStateIndex(figure, reducedMotion)}
          reducedMotion={reducedMotion}
          selectedId={selectedId}
          onSelect={onSelect}
          options={figureOptions(figure, locale, presentationSize)}
          ariaLabel={resolveText(figure.fallbackText, locale)}
          fallback={resolveText(figure.fallbackText, locale)}
        />
      );
    },
  };
}

function workflowAdapter(mode: 'topology' | 'run'): FigureRendererAdapter {
  return {
    id: `workflow.${mode}`,
    validate(figure) {
      const spec = figure.spec as unknown as Partial<WorkflowSpec>;
      if (spec.kind !== 'workflow' || !Array.isArray(spec.nodes)) {
        return ['Workflow Figure spec must contain a WorkflowSpec.'];
      }
      if (mode === 'run' && !spec.runs?.length) {
        return ['workflow.run requires at least one deterministic run fixture.'];
      }
      return [];
    },
    render({ figure, frameIndex, locale, onSelect, reducedMotion, selectedId, presentationSize }) {
      const spec = figure.spec as unknown as WorkflowSpec;
      const runId = mode === 'run' ? spec.runs?.[0]?.id : undefined;
      return (
        <WorkflowScene
          spec={spec}
          mode={mode}
          runId={runId}
          frameIndex={frameIndex ?? figureStateIndex(figure, reducedMotion)}
          reducedMotion={reducedMotion}
          selectedId={selectedId}
          onSelect={onSelect}
          options={figureOptions(figure, locale, presentationSize)}
          ariaLabel={resolveText(figure.fallbackText, locale)}
          fallback={resolveText(figure.fallbackText, locale)}
        />
      );
    },
  };
}

const staticTextAdapter: FigureRendererAdapter = {
  id: 'static.text',
  validate(figure) {
    return isRecord(figure.spec) && typeof figure.spec.text === 'string'
      ? []
      : ['static.text expects spec.text to be a string.'];
  },
  render({ figure }) {
    const text = isRecord(figure.spec) && typeof figure.spec.text === 'string' ? figure.spec.text : '';
    return <pre className="dp-figure-static-text" data-figure-static="text">{text}</pre>;
  },
};

const staticImageAdapter: FigureRendererAdapter = {
  id: 'static.image',
  validate(figure) {
    if (!isRecord(figure.spec) || typeof figure.spec.src !== 'string') return ['static.image expects spec.src to be a string.'];
    return isSafeImageSource(figure.spec.src) ? [] : ['static.image accepts only local, HTTPS, or data:image sources.'];
  },
  render({ figure, locale }) {
    if (!isRecord(figure.spec) || typeof figure.spec.src !== 'string' || !isSafeImageSource(figure.spec.src)) return null;
    const alt = typeof figure.spec.alt === 'string' ? figure.spec.alt : resolveText(figure.fallbackText, locale);
    return <img className="dp-figure-static-image" src={figure.spec.src} alt={alt} data-figure-static="image" />;
  },
};

export function createDefaultFigureRendererRegistry(): FigureRendererRegistry {
  const registry = new FigureRendererRegistry();
  conceptMotionRendererIds.forEach((id) => registry.register(conceptMotionAdapter(id)));
  registry.register(workflowAdapter('topology'));
  registry.register(workflowAdapter('run'));
  registry.register(staticTextAdapter);
  registry.register(staticImageAdapter);
  return registry;
}

const defaultFigureRegistry = createDefaultFigureRendererRegistry();

export interface FigureViewProps {
  figure: FigureSpec;
  presentationSize?: FigurePresentationSize;
  metadataMode?: FigureMetadataMode;
  /** Human-readable attribution; never infer a citation from an internal ID. */
  source?: ReactNode;
  note?: ReactNode;
  registry?: FigureRendererRegistry;
  locale?: string;
  reducedMotion?: boolean;
  frameIndex?: number;
  selectedId?: string;
  onSelect?: (entityId: string) => void;
  className?: string;
  style?: CSSProperties;
  toolbar?: ReactNode;
  actions?: ReactNode;
  exportAction?: ReactNode;
  fallbackMode?: 'visually-hidden' | 'details' | 'visible';
  minimumHeight?: string;
}

export function FigureView({
  figure,
  presentationSize,
  metadataMode = 'consumer',
  source,
  note,
  registry = defaultFigureRegistry,
  locale = 'en',
  reducedMotion = false,
  frameIndex,
  selectedId,
  onSelect,
  className,
  style,
  toolbar,
  actions,
  exportAction,
  fallbackMode = 'details',
  minimumHeight,
}: FigureViewProps) {
  const fallback = resolveText(figure.fallbackText, locale);
  const adapter = registry.get(figure.rendererId);
  const issues = adapter?.validate?.(figure) ?? [];
  const renderable = adapter && issues.length === 0;
  const resolvedFrameIndex = frameIndex ?? figureStateIndex(figure, reducedMotion);
  const metadata = [
    `Figure: ${figure.id}`,
    `Renderer: ${figure.rendererId}`,
    figure.kind,
    ...((figure.conceptIds ?? []).map((id) => `concept:${id}`)),
    ...((figure.featureIds ?? []).map((id) => `feature:${id}`)),
  ];
  const contractDetails = <div className="dp-figure-contract-details">
    <div className="dp-figure-contract-metadata">{metadata.map((item) => <span key={item}>{item}</span>)}</div>
    {figure.sourceIds?.length ? <p>Source IDs: {figure.sourceIds.join(', ')}</p> : null}
    {figure.verifiedAt ? <p>Verified {figure.verifiedAt}</p> : null}
    {typeof figure.status === 'string' && figure.status ? <p>Status: {figure.status}</p> : null}
  </div>;

  return (
    <FigureFrame
      className={className}
      style={style}
      title={resolveText(figure.title, locale)}
      subtitle={resolveOptionalText(figure.subtitle, locale)}
      takeaway={resolveOptionalText(figure.takeaway, locale)}
      metadata={metadataMode === 'developer' ? contractDetails : undefined}
      details={metadataMode === 'consumer' ? <ContentDetails>{contractDetails}</ContentDetails> : undefined}
      toolbar={toolbar}
      actions={actions}
      exportAction={exportAction}
      source={source}
      note={note}
      fallback={fallback}
      fallbackMode={fallbackMode}
      minimumHeight={minimumHeight ?? (presentationSize ? '0' : undefined)}
      data-figure-id={figure.id}
      data-figure-renderer={figure.rendererId}
      data-presentation-size={presentationSize}
      data-metadata-mode={metadataMode}
    >
      {renderable ? adapter.render({ figure, frameIndex: resolvedFrameIndex, locale, onSelect, reducedMotion, selectedId, presentationSize }) : (
        <div role="alert" className="dp-figure-adapter-error">
          <b>Figure unavailable.</b>
          <span>{issues[0] ?? `No adapter is registered for “${figure.rendererId}”.`}</span>
        </div>
      )}
    </FigureFrame>
  );
}

function numericState(value: FigureSpec['staticState']): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function resolveOptionalText(value: LocalizedText | undefined, locale: string): string | undefined {
  return value === undefined ? undefined : resolveText(value, locale);
}

function resolveText(value: LocalizedText, locale: string): string {
  if (typeof value === 'string') return value;
  const entries = value as Record<string, string | undefined>;
  return entries[locale]?.trim() || entries.en?.trim() || Object.values(entries).find((entry) => entry?.trim()) || '';
}

function isSafeImageSource(source: string): boolean {
  const value = source.trim();
  if (!value || value.startsWith('//') || value.includes('\\') || value.includes('\0')) return false;
  if (/^data:image\/(?:png|jpeg|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i.test(value)) return true;
  if (/^https:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      return Boolean(url.hostname) && !url.username && !url.password;
    } catch {
      return false;
    }
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(value)) return false;
  try {
    return !decodeURIComponent(value.split(/[?#]/, 1)[0]).split('/').some((segment) => segment === '..');
  } catch {
    return false;
  }
}
