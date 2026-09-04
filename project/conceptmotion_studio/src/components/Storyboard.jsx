import React, { useEffect, useMemo, useRef, useState } from 'react';
import D3Scene from './D3Scene.jsx';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return undefined;
    const onChange = () => setReduced(media.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

export default function Storyboard({ scene, compact = false }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(2);
  const rootRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const speed = SPEEDS[speedIndex];

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [scene?.id, scene?.title]);

  useEffect(() => {
    if (!playing || !scene || reducedMotion) return undefined;
    if (index >= scene.frames.length - 1) {
      setPlaying(false);
      return undefined;
    }
    const frame = scene.frames[index];
    const baseDelay = Number.isFinite(frame?.hold) ? frame.hold : 1100;
    const timer = window.setTimeout(
      () => setIndex((value) => Math.min(scene.frames.length - 1, value + 1)),
      Math.max(260, baseDelay / speed)
    );
    return () => window.clearTimeout(timer);
  }, [playing, index, speed, scene, reducedMotion]);

  const frame = scene?.frames?.[index];
  const codeFocus = useMemo(() => new Set(frame?.codeFocus || []), [frame]);
  if (!scene || !frame) return null;

  const previous = () => {
    setPlaying(false);
    setIndex((value) => Math.max(0, value - 1));
  };
  const next = () => {
    setPlaying(false);
    setIndex((value) => Math.min(scene.frames.length - 1, value + 1));
  };
  const replay = () => {
    setPlaying(false);
    setIndex(0);
    if (!reducedMotion) window.requestAnimationFrame(() => setPlaying(true));
  };
  const togglePlay = () => {
    if (reducedMotion) return;
    if (index >= scene.frames.length - 1) {
      setIndex(0);
      window.requestAnimationFrame(() => setPlaying(true));
      return;
    }
    setPlaying((value) => !value);
  };

  const onKeyDown = (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previous();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    } else if (event.key === ' ' || event.key.toLowerCase() === 'k') {
      event.preventDefault();
      togglePlay();
    } else if (event.key.toLowerCase() === 'r') {
      event.preventDefault();
      replay();
    }
  };

  const transitionDuration = reducedMotion
    ? 0
    : Math.max(90, (Number.isFinite(frame.duration) ? frame.duration : 520) / speed);

  return (
    <div
      className={`storyboard ${compact ? 'compact' : ''}`}
      ref={rootRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label={`${scene.title} interactive storyboard`}
    >
      <div className="story-stage-card">
        <div className="story-stage-top">
          <div>
            <span className="micro">{scene.renderer.toUpperCase()} RENDERER</span>
            <h2>{scene.title}</h2>
            <p>{scene.subtitle}</p>
          </div>
          <span className="operation-pill" aria-live="polite">{frame.operation || `STEP ${index + 1}`}</span>
        </div>
        <D3Scene scene={scene} frame={frame} duration={transitionDuration} />
        <div className="story-controls" aria-label="Storyboard playback controls">
          <button onClick={previous} disabled={index === 0} aria-label="Previous frame">←</button>
          <button className="play" onClick={togglePlay} disabled={reducedMotion} aria-pressed={playing}>
            {reducedMotion ? 'Step mode' : playing ? 'Pause' : 'Play'}
          </button>
          <button onClick={next} disabled={index === scene.frames.length - 1} aria-label="Next frame">→</button>
          <input
            aria-label="Storyboard step"
            aria-valuetext={`${index + 1} of ${scene.frames.length}: ${frame.operation || frame.caption}`}
            type="range"
            min="0"
            max={scene.frames.length - 1}
            value={index}
            onChange={(event) => {
              setPlaying(false);
              setIndex(Number(event.target.value));
            }}
          />
          <span>{index + 1} / {scene.frames.length}</span>
          <button onClick={() => setSpeedIndex((value) => (value + 1) % SPEEDS.length)} aria-label="Change playback speed">
            {speed.toFixed(2).replace('.00', '')}×
          </button>
          <button onClick={replay} aria-label="Replay storyboard">↺</button>
        </div>
        <p className="story-caption" aria-live="polite">{frame.caption}</p>
        {reducedMotion && <p className="motion-note">Reduced motion is enabled: use previous/next or the scrubber.</p>}
      </div>
      <aside className="code-panel" aria-label="Synchronized code">
        <div className="code-panel-head"><span>SYNCED CODE / PSEUDOCODE</span><b>{frame.operation || 'STATE'}</b></div>
        <pre>{(scene.code || []).map((line, i) => (
          <code key={i} className={codeFocus.has(i) ? 'active' : ''}>
            <span>{String(i + 1).padStart(2, '0')}</span>{line || ' '}
          </code>
        ))}</pre>
        <div className="code-note"><b>Why this matters</b><span>{frame.caption}</span></div>
        <div className="shortcut-note">Keyboard: ←/→ step · Space/K play · R replay</div>
      </aside>
    </div>
  );
}
