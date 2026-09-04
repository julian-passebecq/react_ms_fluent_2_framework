import { createSurface, updateSurface, type SvgSurface } from './dom.js';
import { freezeSvgElement } from './freeze.js';
import type { FreezeOptions, RenderOptions, SvgRenderer } from './types.js';

export abstract class BaseSvgRenderer<Input> implements SvgRenderer<Input> {
  protected surface?: SvgSurface;
  protected options: RenderOptions = {};
  readonly ownerId: string;

  protected constructor(family: string) {
    // A renderer exclusively owns its host; a family-stable ID keeps frozen SVG deterministic.
    this.ownerId = `cm-${family}`;
  }

  mount(host: SVGSVGElement, input: Input, options: RenderOptions = {}): void {
    if (this.surface) this.destroy();
    this.options = options;
    this.surface = createSurface(host, this.ownerId, options);
    this.render(input, true);
  }

  update(input: Input, options: RenderOptions = {}): void {
    if (!this.surface) throw new Error('Renderer must be mounted before update().');
    this.options = { ...this.options, ...options };
    updateSurface(this.surface, this.options);
    this.render(input, false);
  }

  destroy(): void {
    if (!this.surface) return;
    this.beforeDestroy();
    this.surface.host.querySelectorAll(`[data-cm-owner="${this.ownerId}"]`).forEach((node) => node.remove());
    this.surface.host.removeAttribute('data-conceptmotion');
    this.surface.host.removeAttribute('aria-labelledby');
    this.surface = undefined;
  }

  freeze(options: FreezeOptions = {}): string {
    if (!this.surface) throw new Error('Renderer must be mounted before freeze().');
    return freezeSvgElement(this.surface.host, options);
  }

  protected get reducedMotion(): boolean {
    return this.options.reducedMotion ?? false;
  }

  protected get durationMs(): number {
    return this.reducedMotion ? 0 : (this.options.transitionDurationMs ?? 240);
  }

  protected beforeDestroy(): void {
    // Renderer families override this when they own timers, observers or simulations.
  }

  protected abstract render(input: Input, initial: boolean): void;
}
