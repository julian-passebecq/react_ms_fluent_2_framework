import { useState } from 'react';
import { Switch } from '@fluentui/react-components';
import { FigurePlayer } from '@datapass/figure';
import { useReducedMotion } from '@conceptmotion/react';
import type { VisualMigration } from '../../../content/visuals';
export default function SceneDetail({ entry, locale }: { entry: VisualMigration; locale: string }) {
  const [reduced, setReduced] = useState<boolean | undefined>();
  const actualReduced = useReducedMotion(reduced);
  return <><a href="#" className="atlas-back">← All concepts</a><header className="atlas-heading"><p className="atlas-eyebrow">{entry.domain}</p><h1>{String(entry.figure.title)}</h1><p>{entry.invariant}</p></header><Switch label="Reduced motion" checked={actualReduced} onChange={(_, data) => setReduced(data.checked)} /><FigurePlayer figure={entry.figure} captions={entry.captions} locale={locale} reducedMotion={reduced} /><section className="atlas-source"><h2>Source & interpretation</h2><p>This is a semantic adaptation with a small illustrative dataset, not a replay of a full coding problem or model training.</p><p>{entry.source.label}. Source reference: {entry.source.id}. Private source locations are not published.</p><p>Reference snapshot: 4 September 2026. Source family: {entry.sourceFamily}.</p></section></>;
}
