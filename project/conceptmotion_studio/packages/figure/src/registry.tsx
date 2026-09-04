import type { WorkflowSpec } from '@conceptmotion/core';
import { ConceptScene, WorkflowScene } from '@conceptmotion/react';
import { rendererIdForScene, type SvgSceneSpec } from '@conceptmotion/svg';
import type { FigureSpec, LocalizedText } from '@datapass/content';
import { FigureFrame } from '@datapass/ui';
import type { CSSProperties, ReactNode } from 'react';

export interface FigureRenderContext {
  figure: FigureSpec;
  locale: string;
  reducedMotion: boolean;
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
    render({ figure, frameIndex, locale, onSelect, reducedMotion, selectedId }) {
      return (
        <ConceptScene
          spec={figure.spec as unknown as SvgSceneSpec}
          frameIndex={frameIndex ?? figureStateIndex(figure, reducedMotion)}
          reducedMotion={reducedMotion}
          selectedId={selectedId}
          onSelect={onSelect}
          options={{ locale: locale === 'no' ? 'no' : 'en' }}
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
    render({ figure, frameIndex, locale, onSelect, reducedMotion, selectedId }) {
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
          options={{ locale: locale === 'no' ? 'no' : 'en' }}
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
    figure.kind,
    ...((figure.conceptIds ?? []).map((id) => `concept:${id}`)),
    ...((figure.featureIds ?? []).map((id) => `feature:${id}`)),
  ];

  return (
    <FigureFrame
      className={className}
      style={style}
      title={resolveText(figure.title, locale)}
      subtitle={resolveOptionalText(figure.subtitle, locale)}
      takeaway={resolveOptionalText(figure.takeaway, locale)}
      metadata={metadata.length ? <div className="dp-figure-contract-metadata">{metadata.map((item) => <span key={item}>{item}</span>)}</div> : undefined}
      toolbar={toolbar}
      actions={actions}
      exportAction={exportAction}
      source={figure.sourceIds?.length ? `Source IDs: ${figure.sourceIds.join(', ')}` : undefined}
      note={figure.verifiedAt ? `Verified ${figure.verifiedAt}` : undefined}
      fallback={fallback}
      fallbackMode={fallbackMode}
      minimumHeight={minimumHeight}
      data-figure-id={figure.id}
      data-figure-renderer={figure.rendererId}
    >
      {renderable ? adapter.render({ figure, frameIndex: resolvedFrameIndex, locale, onSelect, reducedMotion, selectedId }) : (
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
