import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { validateFigureSpec, type JsonValue } from '@datapass/content';
import { FigureView, figureStepCount } from '@datapass/figure';
import { isDemoPayload, payload, storyAdapter, storyFigure, storyRegistry } from '../src/story';

describe('independent renderer contract', () => {
  it('keeps step semantics consumer-owned and renders every step through FigureView', () => {
    expect(validateFigureSpec(storyFigure).valid).toBe(true);
    expect(figureStepCount(storyFigure)).toBe(1); // beats are deliberately unknown to Figure.
    expect(storyRegistry.ids()).toEqual(['external.story.demo']);
    for (const [index, beat] of payload.beats.entries()) {
      const markup = renderToStaticMarkup(<FigureView figure={storyFigure} registry={storyRegistry} frameIndex={index} reducedMotion />);
      expect(markup).toContain(`translateX(${beat.position}px)`);
      expect(markup).toContain(beat.annotation);
      expect(markup).not.toContain('data-conceptmotion');
    }
  });
  it('rejects missing, version-mismatched and malformed steps before rendering', () => {
    const invalidPayloads: JsonValue[] = [null, [], {}, { version: 2, beats: payload.beats }, { version: 1, beats: [] },
      { version: 1, beats: [{ name: 'X', position: 'left' }] },
      { version: 1, beats: [{ name: 'X', position: Infinity, annotation: 'X' }] }];
    for (const spec of invalidPayloads) {
      expect(isDemoPayload(spec)).toBe(false);
      const invalid = { ...storyFigure, spec };
      expect(storyAdapter.validate!(invalid)).not.toEqual([]);
      const markup = renderToStaticMarkup(<FigureView figure={invalid} registry={storyRegistry} fallbackMode="visible" />);
      expect(markup).toContain('role="alert"');
      expect(markup).toContain(storyFigure.fallbackText);
      expect(markup).not.toContain('<svg');
    }
  });
});
