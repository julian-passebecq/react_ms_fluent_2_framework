import { useState } from 'react';
import { Button } from '@fluentui/react-components';
import { AppShell, PageHeader, TopBar } from '@datapass/ui';
import { FigurePlayer } from '@datapass/figure';
import { practiceItems } from '@datapass/canonical/practice';
import { hasPracticeVisual } from '@datapass/canonical/visual-availability';
import { figureForPracticeId } from '@datapass/canonical/visuals';
import { visualExplanationFigure, visualExplanationFigures } from '@datapass/canonical/explanations';
import { dataPlatformFigure, dataPlatformFigures, dataPlatformSource } from '@datapass/canonical/data-platform';

const example = practiceItems.find(item => item.id === 'al-binary-search')!;
const figure = figureForPracticeId(example.id)!;

export function App() {
  const [exploring, setExploring] = useState(false);
  const selected = new URLSearchParams(location.search).get('explanation');
  const platform = new URLSearchParams(location.search).get('platform');
  if (platform) return <AppShell topBar={<TopBar brand="Data-platform lesson" />} mainLabel="Data-platform lesson" skipLinkLabel="Skip to content">
    <PageHeader title={platform === 'lesson' ? 'Can a dimension change Revenue?' : platform === 'topology-and-run' ? 'Dependencies and a particular run' : 'Author with semantic data'} description="Follow the fields, relationships and responsibilities in the shared Figures." />
    {platform === 'lesson' || platform === 'topology-and-run' ? <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 26rem), 1fr))', gap: '1rem' }}>
        {(platform === 'lesson' ? ['sales-star-schema', 'sales-kpi-lineage'] : ['backfill-dependencies', 'de-backfill']).map(id => <FigurePlayer key={id} figure={dataPlatformFigure(id)} presentationSize="compact" source={dataPlatformSource.label} />)}
      </div>
      <details><summary>Reasoning guide</summary><p>{platform === 'lesson' ? 'Product filters propagate to order-line facts; Revenue sums the remaining sales_amount values.' : 'Publish remains pending until both date tasks succeed. Retrying a date preserves its scope.'}</p></details>
    </> : <>
      <label>Data-platform example <select aria-label="Data-platform example" value={platform} onChange={event => { location.search = `?platform=${encodeURIComponent(event.target.value)}`; }}>{dataPlatformFigures.map(figure => <option key={figure.id} value={figure.id}>{String(figure.title)}</option>)}</select></label>
      <FigurePlayer figure={dataPlatformFigure(platform)} presentationSize="compact" source={dataPlatformSource.label} />
    </>}
  </AppShell>;
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
