import { useState } from 'react';
import { Button } from '@fluentui/react-components';
import { AppShell, PageHeader, TopBar } from '@datapass/ui';
import { FigurePlayer } from '@datapass/figure';
import { practiceItems } from '@datapass/canonical/practice';
import { hasPracticeVisual } from '@datapass/canonical/visual-availability';
import { figureForPracticeId } from '@datapass/canonical/visuals';

const example = practiceItems.find(item => item.id === 'al-binary-search')!;
const figure = figureForPracticeId(example.id)!;

export function App() {
  const [exploring, setExploring] = useState(false);
  return <AppShell topBar={<TopBar brand="Learning example" />} mainLabel="Learning example" skipLinkLabel="Skip to content">
    <PageHeader title="Find a value with binary search" description="Follow how the candidate interval gets smaller." />
    <p>{practiceItems.length} practice activities</p>
    {hasPracticeVisual(example.id) && <Button appearance="primary" onClick={() => setExploring(true)}>Explore</Button>}
    {exploring && <FigurePlayer figure={figure} presentationSize="compact" reducedMotion showInspector={false} source="Author-provided coding-practice reference" />}
  </AppShell>;
}
