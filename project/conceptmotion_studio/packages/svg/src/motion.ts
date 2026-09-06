export interface MotionRunOptions {
  readonly durationMs: number;
  readonly delayMs?: number;
  readonly easing?: string;
  readonly fill?: FillMode;
}

/**
 * Small renderer-owned Web Animations wrapper.
 *
 * ConceptMotion keeps semantic state in its specs/renderers. Native browser
 * animation is only a presentation effect layered over a deterministic final
 * SVG state, so reduced-motion and static export remain first-class.
 */
export class MotionController {
  private readonly active = new Set<Animation>();

  run(
    element: Element,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: MotionRunOptions,
    reducedMotion = false,
  ): Animation | undefined {
    if (reducedMotion || typeof element.animate !== 'function') return undefined;
    try {
      const animation = element.animate(keyframes, {
        duration: Math.max(0, options.durationMs),
        delay: Math.max(0, options.delayMs ?? 0),
        easing: options.easing ?? 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: options.fill ?? 'none',
      });
      this.active.add(animation);
      const cleanup = () => this.active.delete(animation);
      animation.addEventListener?.('finish', cleanup, { once: true });
      animation.addEventListener?.('cancel', cleanup, { once: true });
      return animation;
    } catch {
      // Older/non-browser render environments still keep the deterministic
      // final SVG state; motion is a progressive enhancement.
      return undefined;
    }
  }

  cancelAll(): void {
    for (const animation of this.active) {
      try { animation.cancel(); } catch { /* no-op */ }
    }
    this.active.clear();
  }
}
