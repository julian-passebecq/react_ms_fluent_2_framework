import type { FigureSpec } from '@datapass/content';
import { FigureRendererRegistry, type FigureRendererAdapter } from '@datapass/figure';
import { datapassSurfaceTokens as surfaces } from '@datapass/ui';

// Consumer-owned fixture shape; not a framework story/chart contract.
export type DemoPayload = { version: 1; beats: { name: string; position: number; annotation: string }[] };
export const payload: DemoPayload = { version: 1, beats: [
  { name: 'Start', position: 40, annotation: 'The point starts on the left.' },
  { name: 'Middle', position: 160, annotation: 'The same point moves to the middle.' },
  { name: 'Finish', position: 280, annotation: 'The point reaches the right.' },
] };

export function isDemoPayload(value: unknown): value is DemoPayload {
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('beats' in value) || !Array.isArray(value.beats) || !value.beats.length) return false;
  return value.beats.every(beat => beat && typeof beat === 'object'
    && typeof beat.name === 'string' && beat.name.trim() && typeof beat.annotation === 'string' && beat.annotation.trim()
    && typeof beat.position === 'number' && Number.isFinite(beat.position) && beat.position >= 40 && beat.position <= 280);
}

export const storyFigure: FigureSpec = {
  id: 'external-story', kind: 'concept', rendererId: 'external.story.demo',
  title: 'One point, three positions', subtitle: 'Follow a point from start to finish.',
  takeaway: 'Each step keeps the same point and changes its position.',
  fallbackText: 'A point moves from left to middle to right across three steps.',
  spec: payload, staticState: 1, reducedMotionState: 2,
};

export const storyAdapter: FigureRendererAdapter = {
  id: 'external.story.demo',
  validate: figure => isDemoPayload(figure.spec) ? [] : ['Unsupported demo payload or step shape.'],
  render: ({ figure, frameIndex = 0, reducedMotion }) => {
    // The validator owns payload semantics; Figure only supplies a frame number.
    if (!isDemoPayload(figure.spec)) return null;
    const beat = figure.spec.beats[Math.min(figure.spec.beats.length - 1, Math.max(0, frameIndex))];
    return <svg viewBox="0 0 320 120" role="img" aria-label={`${beat.name}: ${beat.annotation}`}
      data-external-story data-active-step={frameIndex} data-motion={String(reducedMotion)}
      style={{ display: 'block', width: '100%', height: 'auto', maxHeight: '240px' }}>
      <title>{beat.name}</title><desc>{beat.annotation}</desc>
      <line x1="40" y1="50" x2="280" y2="50" stroke={surfaces.borderSubtle} strokeWidth="2" />
      <circle data-story-point cx="0" cy="50" r="12" fill={surfaces.accentTeal}
        style={{ transform: `translateX(${beat.position}px)`, transition: reducedMotion ? 'none' : 'transform 400ms linear' }} />
      {['Start', 'Middle', 'Finish'].map((name, index) => <text key={name} x={40 + index * 120} y="98" textAnchor="middle" fill={surfaces.inkPrimary} fontSize="14">{name}</text>)}
    </svg>;
  },
};

// A consumer owns this instance. No default registry mutation or marker spoofing.
export const storyRegistry = new FigureRendererRegistry().register(storyAdapter);
