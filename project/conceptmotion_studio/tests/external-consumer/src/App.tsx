import { useState } from 'react';
import { Button } from '@fluentui/react-components';
import { AppShell, PageHeader, TopBar } from '@datapass/ui';
import { FigurePlayer } from '@datapass/figure';
import { practiceItems } from '@datapass/canonical/practice';
import { hasPracticeVisual } from '@datapass/canonical/visual-availability';
import { figureForPracticeId } from '@datapass/canonical/visuals';
import { visualExplanationFigure, visualExplanationFigures } from '@datapass/canonical/explanations';

const example = practiceItems.find(item => item.id === 'al-binary-search')!;
const figure = figureForPracticeId(example.id)!;

export function App() {
  const [exploring, setExploring] = useState(false);
  const selected = new URLSearchParams(location.search).get('explanation');
  if (selected) return <AppShell topBar={<TopBar brand="Visual explanations" />} mainLabel="Visual explanations" skipLinkLabel="Skip to content">
    <PageHeader title="Follow the data, one step at a time" description="Deterministic teaching scenes with shared playback, code and state." />
    <label>Explanation <select aria-label="Explanation" value={selected} onChange={event => { location.search = `?explanation=${encodeURIComponent(event.target.value)}`; }}>{visualExplanationFigures.map(f => <option key={f.id} value={f.id}>{String(f.title)}</option>)}</select></label>
    <FigurePlayer figure={visualExplanationFigure(selected)} presentationSize="compact" showInspector={false} source="Illustrative data and semantic explanations by Julian Passebecq." />
  </AppShell>;
  return <AppShell topBar={<TopBar brand="Learning example" />} mainLabel="Learning example" skipLinkLabel="Skip to content">
    <PageHeader title="Find a value with binary search" description="Follow how the candidate interval gets smaller." />
    <p>{practiceItems.length} practice activities</p>
    {hasPracticeVisual(example.id) && <Button appearance="primary" onClick={() => setExploring(true)}>Explore</Button>}
    {exploring && <FigurePlayer figure={figure} presentationSize="compact" reducedMotion showInspector={false} source="Author-provided coding-practice reference" />}
  </AppShell>;
}
