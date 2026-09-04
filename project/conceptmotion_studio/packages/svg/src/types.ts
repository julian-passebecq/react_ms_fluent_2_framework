import type { EntityId } from '@conceptmotion/core';

import type { SemanticTheme } from './theme.js';

export interface RendererViewport {
  width: number;
  height: number;
}

export interface RenderOptions extends Partial<RendererViewport> {
  theme?: Partial<SemanticTheme>;
  reducedMotion?: boolean;
  transitionDurationMs?: number;
  selectedId?: EntityId;
  onSelect?: (id: EntityId) => void;
  locale?: 'en' | 'no';
}

export interface FreezeOptions {
  /** Remove runtime-only attributes such as transition hints. Defaults to true. */
  stripRuntimeState?: boolean;
  /** Add the XML namespace when the host omitted it. Defaults to true. */
  includeNamespace?: boolean;
}

/** A renderer instance owns exactly one SVG host for its mounted lifetime. */
export interface SvgRenderer<Input> {
  mount(host: SVGSVGElement, input: Input, options?: RenderOptions): void;
  update(input: Input, options?: RenderOptions): void;
  destroy(): void;
  freeze(options?: FreezeOptions): string;
}

export interface SvgRendererFactory<Input = unknown> {
  (): SvgRenderer<Input>;
}

export interface RendererRegistration<Input = unknown> {
  id: string;
  family: string;
  description?: string;
  create: SvgRendererFactory<Input>;
}

export type AnyRendererRegistration = RendererRegistration<never>;

export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point {
  width: number;
  height: number;
}

export interface PositionedEntity extends Rect {
  id: EntityId;
}
