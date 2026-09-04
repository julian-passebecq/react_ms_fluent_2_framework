import type { Locale, TimelineControlLabels } from '@datapass/ui';

export function timelineLabels(locale: Locale): Partial<TimelineControlLabels> | undefined {
  if (locale === 'en') return undefined;
  return {
    controls: 'Tidslinjekontroller',
    previous: 'Forrige',
    next: 'Neste',
    play: 'Spill av',
    pause: 'Pause',
    playUnavailable: 'Avspilling er utilgjengelig når redusert bevegelse er aktivert',
    playDisabledTitle: 'Avspilling er deaktivert av innstillingen for redusert bevegelse; trinn- og spolekontrollene er fortsatt tilgjengelige.',
    seek: 'Trinn på tidslinjen',
    speed: 'Avspillingshastighet',
    reset: 'Tilbakestill',
    step: (current, total) => `${current} av ${total}`,
  };
}

export function figureLabels(locale: Locale) {
  return locale === 'no'
    ? {
        actionsLabel: 'Figurhandlinger',
        fallbackLabel: 'Tekstalternativ',
        sourceLabel: 'Kilde',
        noteLabel: 'Merknad',
      }
    : {};
}
