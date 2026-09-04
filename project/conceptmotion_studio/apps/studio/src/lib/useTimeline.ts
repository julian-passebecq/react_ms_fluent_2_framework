import { useEffect, useMemo, useState } from 'react';

const speedOptions = [0.5, 1, 1.5, 2];

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
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

export function useTimeline(stepCount: number, identity: string, delay = 1200) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [identity]);

  useEffect(() => {
    if (!isPlaying || reducedMotion || stepCount < 2) return undefined;
    if (currentStep >= stepCount - 1) {
      setIsPlaying(false);
      return undefined;
    }
    const timer = window.setTimeout(
      () => setCurrentStep((value) => Math.min(stepCount - 1, value + 1)),
      Math.max(240, delay / speed),
    );
    return () => window.clearTimeout(timer);
  }, [currentStep, delay, isPlaying, reducedMotion, speed, stepCount]);

  const controls = useMemo(() => ({
    currentStep,
    stepCount,
    isPlaying,
    speed,
    speedOptions,
    onPlayPause: () => {
      if (reducedMotion) return;
      if (currentStep >= stepCount - 1) setCurrentStep(0);
      setIsPlaying((value) => !value);
    },
    onPrevious: () => {
      setIsPlaying(false);
      setCurrentStep((value) => Math.max(0, value - 1));
    },
    onNext: () => {
      setIsPlaying(false);
      setCurrentStep((value) => Math.min(stepCount - 1, value + 1));
    },
    onSeek: (value: number) => {
      setIsPlaying(false);
      setCurrentStep(Math.max(0, Math.min(stepCount - 1, value)));
    },
    onSpeedChange: setSpeed,
    onReset: () => {
      setIsPlaying(false);
      setCurrentStep(0);
    },
    disabled: stepCount < 2,
    playDisabled: reducedMotion,
  }), [currentStep, isPlaying, reducedMotion, speed, stepCount]);

  return { currentStep, setCurrentStep, isPlaying, speed, reducedMotion, controls };
}
