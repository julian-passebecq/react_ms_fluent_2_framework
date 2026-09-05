import { useState } from 'react';
import { Button } from '@fluentui/react-components';
import { AppShell, CatalogShell, PageHeader, TopBar, Workbench } from '@datapass/ui';
import { FigurePlayer, FigureView } from '@datapass/figure';
import { CodeEditor } from '@datapass/code';
import { payload, storyFigure, storyRegistry } from './story';

export function App() {
  const [exploring, setExploring] = useState(false);
  const [code, setCode] = useState(false);
  const mode = new URLSearchParams(location.search).get('mode');
  const figure = mode === 'missing' ? { ...storyFigure, rendererId: 'external.missing' }
    : mode === 'invalid' ? { ...storyFigure, spec: null }
    : mode === 'unsupported' ? { ...storyFigure, spec: { version: 1, beats: [{ name: 'Unknown', position: 'left' }] } }
    : storyFigure;
  const props = { figure, registry: storyRegistry, presentationSize: 'compact' as const,
    source: 'Consumer-authored demonstration.', note: 'Positions are illustrative.', fallbackMode: 'details' as const };
  return <AppShell topBar={<TopBar brand="External visual lab" />} mainLabel="External visual lab" skipLinkLabel="Skip to content">
    <div className="generated-page">
      <PageHeader title="Three positions" description="Explore the story one step at a time." />
      <CatalogShell resultsLabel="Stories" results={<Button appearance="primary" onClick={() => setExploring(true)}>Explore story</Button>} />
      {exploring && <Workbench canvasLabel="Story workbench" canvas={mode === 'view'
        ? <FigureView {...props} reducedMotion />
        : <FigurePlayer {...props} stepCount={payload.beats.length} captions={payload.beats.map(beat => beat.annotation)} showInspector={false} />}
        bottomPanel={<><Button onClick={() => setCode(value => !value)}>{code ? 'Hide code' : 'Show code'}</Button>
          {code && <CodeEditor ariaLabel="Story JSON" language="json" value={JSON.stringify(payload, null, 2)} readOnly height="240px" />}</>} />}
    </div>
  </AppShell>;
}
