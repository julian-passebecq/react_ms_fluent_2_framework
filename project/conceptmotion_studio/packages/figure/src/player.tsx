import { useReducedMotion } from '@conceptmotion/react';
import { freezeSvgElement } from '@conceptmotion/svg';
import type { FigureSpec, LocalizedText } from '@datapass/content';
import { InspectorPanel, TimelineControls } from '@datapass/ui';
import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { FigureView, type FigureViewProps } from './registry';

const record = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const text = (value: LocalizedText | undefined, locale: string) => typeof value === 'string' ? value : value?.[locale as 'en' | 'no'] ?? value?.en ?? '';

export function figureStepCount(figure: FigureSpec): number {
  if (!record(figure.spec)) return 1;
  if (Array.isArray(figure.spec.frames)) return Math.max(1, figure.spec.frames.length);
  if (Array.isArray(figure.spec.revealCounts)) return Math.max(1, figure.spec.revealCounts.length);
  const run = Array.isArray(figure.spec.runs) ? figure.spec.runs[0] : undefined;
  return record(run) && Array.isArray(run.frames) ? Math.max(1, run.frames.length) : 1;
}

export interface FigurePlayerProps extends FigureViewProps {
  captions?: readonly LocalizedText[];
  stepCount?: number;
  showInspector?: boolean;
  onFrameChange?: (frame: number) => void;
}

/** Reusable explanation controls; no runtime, editor, or consumer content dependency. */
export function FigurePlayer({ figure, captions, stepCount: explicitCount, showInspector = true, onFrameChange, frameIndex: controlledFrame, selectedId: controlledSelection, onSelect, reducedMotion: explicitReducedMotion, locale = 'en', exportAction, toolbar, ...rest }: FigurePlayerProps) {
  const accessibilityPrefix = `figure-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const host = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [selection, setSelection] = useState<string>();
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [exportStatus, setExportStatus] = useState('');
  const [hasSvg, setHasSvg] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const reducedMotion = useReducedMotion(explicitReducedMotion);
  const count = Math.max(1, explicitCount ?? figureStepCount(figure));
  const current = Math.max(0, Math.min(count - 1, controlledFrame ?? index));
  const selectedId = controlledSelection ?? selection;
  const seek = (value: number) => { const next = Math.max(0, Math.min(count - 1, value)); setIndex(next); onFrameChange?.(next); };
  useEffect(() => { setIndex(0); setSelection(undefined); setPlaying(false); setExportStatus(''); }, [figure.id]);
  useEffect(() => { if (reducedMotion) setPlaying(false); }, [reducedMotion]);
  useEffect(() => {
    const node = host.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const measure = () => setNarrow(node.getBoundingClientRect().width < 600);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const canvas = host.current?.querySelector<HTMLElement>('.dp-visualization-surface__renderer');
    if (!canvas) return;
    if (narrow && hasSvg) {
      canvas.tabIndex = 0; canvas.setAttribute('role', 'region'); canvas.setAttribute('aria-label', 'Scrollable figure canvas');
    } else {
      canvas.removeAttribute('tabindex'); canvas.removeAttribute('role'); canvas.removeAttribute('aria-label');
    }
  }, [narrow, hasSvg, figure.id]);
  useEffect(() => {
    if (!playing || reducedMotion || count <= 1) return;
    if (current >= count - 1) { setPlaying(false); return; }
    const timer = setTimeout(() => seek(current + 1), 1200 / speed);
    return () => clearTimeout(timer);
  }, [playing, reducedMotion, current, count, speed]);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const check = () => {
      const svg = node.querySelector('svg[data-conceptmotion]');
      setHasSvg(Boolean(svg && !svg.closest('[data-renderer-error="true"]')));
      if (!svg) return;
      // Several same-family figures may coexist in a lesson. Namespace live ARIA
      // targets without changing legacy renderer IDs or semantic geometry.
      const title = svg.querySelector('title[data-cm-owner]');
      const description = svg.querySelector('desc[data-cm-owner]');
      if (!title || !description) return;
      const titleId = `${accessibilityPrefix}-title`;
      const descriptionId = `${accessibilityPrefix}-description`;
      if (title.id !== titleId) title.id = titleId;
      if (description.id !== descriptionId) description.id = descriptionId;
      const targets = `${titleId} ${descriptionId}`;
      if (svg.getAttribute('aria-labelledby') !== targets) svg.setAttribute('aria-labelledby', targets);
      svg.setAttribute('data-figure-player-a11y', accessibilityPrefix);
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(node, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-renderer-error', 'id', 'aria-labelledby'] });
    return () => observer.disconnect();
  }, [figure.id, figure.spec, accessibilityPrefix]);
  const filename = `${figure.id.replace(/[\x00-\x1f\x7f/\\:*?"<>|]/g, '-').slice(0, 120) || 'figure'}.svg`;
  const download = (event: MouseEvent<HTMLAnchorElement>) => {
    const svg = host.current?.querySelector<SVGSVGElement>('svg[data-conceptmotion]');
    if (!svg) { event.preventDefault(); setExportStatus('SVG export is unavailable for this figure or fallback state.'); return; }
    event.currentTarget.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(freezeSvgElement(svg))}`;
    setExportStatus('Static SVG exported from the current production renderer state.');
  };
  return <div ref={host} className="dp-figure-player" data-reduced-motion={String(reducedMotion)} data-frame-index={current} data-pannable={String(narrow && hasSvg)}>
    {narrow && hasSvg ? <p className="dp-figure-player__pan-hint">Scroll the figure sideways to read its details. Keyboard selection and captions remain available.</p> : null}
    <FigureView {...rest} figure={figure} locale={locale} reducedMotion={reducedMotion} frameIndex={current} selectedId={selectedId} onSelect={id => { setSelection(id); onSelect?.(id); }}
      toolbar={<>{toolbar}{hasSvg && count > 1 ? <TimelineControls currentStep={current} stepCount={count} isPlaying={playing} onPlayPause={() => { if (current >= count - 1) seek(0); setPlaying(value => !value); }} onPrevious={() => { setPlaying(false); seek(current - 1); }} onNext={() => { setPlaying(false); seek(current + 1); }} onSeek={value => { setPlaying(false); seek(value); }} onReset={() => { setPlaying(false); seek(0); }} speed={speed} onSpeedChange={setSpeed} playDisabled={reducedMotion} /> : null}</>}
      exportAction={exportAction ?? (hasSvg ? <a href="#figure-export" download={filename} onClick={download}>Export SVG</a> : <span>SVG export unavailable for this renderer</span>)} />
    <p className="dp-figure-player__caption" aria-live="polite">{captions?.length ? text(captions[Math.min(current, captions.length - 1)], locale) : text(figure.takeaway ?? figure.fallbackText, locale)}</p>
    {reducedMotion ? <p className="dp-figure-player__motion">Reduced motion: static steps remain available; automatic playback is off.</p> : null}
    {exportStatus ? <p role="status">{exportStatus}</p> : null}
    {showInspector ? <InspectorPanel title="Selection inspector"><p>{selectedId ? `Selected: ${selectedId}` : 'Select a mark, row, node or edge to inspect its stable semantic ID.'}</p></InspectorPanel> : null}
  </div>;
}
