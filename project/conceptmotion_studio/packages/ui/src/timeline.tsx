import { Button, Select, Slider, Toolbar } from '@fluentui/react-components';
import type { HTMLAttributes } from 'react';
import { mergeClassNames } from './internal';

export interface TimelineControlLabels {
  controls: string;
  previous: string;
  next: string;
  play: string;
  pause: string;
  playUnavailable: string;
  playDisabledTitle: string;
  seek: string;
  speed: string;
  reset: string;
  step(current: number, total: number): string;
}

const defaultLabels: TimelineControlLabels = {
  controls: 'Timeline controls',
  previous: 'Previous',
  next: 'Next',
  play: 'Play',
  pause: 'Pause',
  playUnavailable: 'Play unavailable while reduced motion is enabled',
  playDisabledTitle: 'Playback is disabled by the reduced-motion preference; step and scrub controls remain available.',
  seek: 'Timeline step',
  speed: 'Playback speed',
  reset: 'Reset',
  step: (current, total) => `${current} of ${total}`,
};

export interface TimelineControlsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  currentStep: number;
  stepCount: number;
  isPlaying: boolean;
  onPlayPause(): void;
  onPrevious(): void;
  onNext(): void;
  onSeek(step: number): void;
  speed?: number;
  speedOptions?: readonly number[];
  onSpeedChange?: (speed: number) => void;
  onReset?: () => void;
  disabled?: boolean;
  playDisabled?: boolean;
  labels?: Partial<TimelineControlLabels>;
}

export function TimelineControls({
  currentStep,
  stepCount,
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  speed = 1,
  speedOptions = [0.5, 0.75, 1, 1.5, 2],
  onSpeedChange,
  onReset,
  disabled = false,
  playDisabled = false,
  labels,
  className,
  ...rest
}: TimelineControlsProps) {
  const text: TimelineControlLabels = {
    ...defaultLabels,
    ...labels,
    step: labels?.step ?? defaultLabels.step,
  };
  const lastStep = Math.max(0, stepCount - 1);
  const safeStep = Math.min(Math.max(0, currentStep), lastStep);
  const displayStep = stepCount > 0 ? safeStep + 1 : 0;

  return (
    <div className={mergeClassNames('dp-timeline-controls', className)} {...rest}>
      <Toolbar className="dp-timeline-controls__buttons" aria-label={text.controls}>
        <Button
          appearance="subtle"
          size="small"
          type="button"
          aria-label={text.previous}
          disabled={disabled || safeStep <= 0}
          onClick={onPrevious}
        >
          ←
        </Button>
        <Button
          appearance="primary"
          size="small"
          type="button"
          aria-label={playDisabled ? text.playUnavailable : isPlaying ? text.pause : text.play}
          title={playDisabled ? text.playDisabledTitle : undefined}
          aria-pressed={isPlaying}
          disabled={disabled || playDisabled || stepCount <= 1}
          onClick={onPlayPause}
        >
          {isPlaying ? text.pause : text.play}
        </Button>
        <Button
          appearance="subtle"
          size="small"
          type="button"
          aria-label={text.next}
          disabled={disabled || stepCount === 0 || safeStep >= lastStep}
          onClick={onNext}
        >
          →
        </Button>
      </Toolbar>
      <Slider
        className="dp-timeline-controls__slider"
        min={0}
        max={lastStep}
        step={1}
        value={safeStep}
        disabled={disabled || stepCount <= 1}
        aria-label={text.seek}
        aria-valuetext={text.step(displayStep, stepCount)}
        onChange={(_, data) => onSeek(data.value)}
      />
      <output className="dp-timeline-controls__step" aria-live="polite">
        {text.step(displayStep, stepCount)}
      </output>
      {onSpeedChange ? (
        <label className="dp-timeline-controls__speed">
          <span className="dp-visually-hidden">{text.speed}</span>
          <Select
            size="small"
            value={String(speed)}
            aria-label={text.speed}
            disabled={disabled}
            onChange={(event) => onSpeedChange(Number(event.currentTarget.value))}
          >
            {speedOptions.map((option) => (
              <option key={option} value={option}>
                {option}×
              </option>
            ))}
          </Select>
        </label>
      ) : null}
      {onReset ? (
        <Button appearance="subtle" size="small" type="button" disabled={disabled} onClick={onReset}>
          {text.reset}
        </Button>
      ) : null}
    </div>
  );
}
