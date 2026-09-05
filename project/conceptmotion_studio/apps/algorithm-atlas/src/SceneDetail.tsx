import { useState } from 'react';
import { Switch } from '@fluentui/react-components';
import { FigurePlayer } from '@datapass/figure';
import { ContentDetails } from '@datapass/ui';
import { useReducedMotion } from '@conceptmotion/react';
import type { VisualMigration } from '../../../content/visuals';
export default function SceneDetail({ entry, locale }: { entry: VisualMigration; locale: string }) {
  const [reduced, setReduced] = useState<boolean | undefined>();
  const actualReduced = useReducedMotion(reduced);
  return <><a href="#" className="atlas-back">← All concepts</a><header className="atlas-heading"><p className="atlas-eyebrow">{entry.domain}</p><h1>{String(entry.figure.title)}</h1><p>{entry.invariant}</p></header><Switch label="Reduced motion" checked={actualReduced} onChange={(_, data) => setReduced(data.checked)} /><FigurePlayer figure={entry.figure} captions={entry.captions} locale={locale} reducedMotion={reduced} presentationSize="compact" /><section className="atlas-source"><p>Adapted from {entry.source.label}, using a small illustrative dataset.</p><ContentDetails><p>This explains the concept; it does not replay a full coding problem or train a model.</p><p>Source reference: {entry.source.id}. Reference snapshot: 4 September 2026. Source family: {entry.sourceFamily}.</p></ContentDetails></section></>;
}
