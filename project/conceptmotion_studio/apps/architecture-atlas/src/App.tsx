import { lazy, Suspense, useMemo, useState } from 'react';
import { Button, Select, Switch, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@fluentui/react-components';
import { ContentDetails, InspectorPanel, LanguageToggle, useLocale } from '@datapass/ui';
import { useReducedMotion } from '@conceptmotion/react';
import { architectureFigure, architectureSource, lineageFigure, providerNames, providers, stageIntent, stageNames, stages, translations, workloadNames, type Provider, type Stage, type Workload } from './data';
import { visualById } from '../../../content/visuals';
const FigurePlayer = lazy(() => import('@datapass/figure').then(module => ({ default: module.FigurePlayer })));

export default function App() {
  const [workload, setWorkload] = useState<Workload>('medallion');
  const [provider, setProvider] = useState<Provider>('conceptual');
  const [layout, setLayout] = useState<'layered' | 'radial'>('layered');
  const [stage, setStage] = useState<Stage>('source');
  const [view, setView] = useState('architecture');
  const [reduced, setReduced] = useState<boolean | undefined>();
  const actualReduced = useReducedMotion(reduced);
  const { locale } = useLocale();
  const figure = useMemo(() => architectureFigure(workload, provider, layout), [workload, provider, layout]);
  const retry = visualById('de-retry')!;
  const displayed = view === 'lineage' ? lineageFigure : view === 'workflow' ? retry.figure : figure;
  return <div className="architecture-app dp-consumer"><a className="architecture-skip" href="#main">Skip to content</a><header className="architecture-top"><strong>Architecture Atlas</strong><span>Stage first. Provider second.</span><LanguageToggle /></header><main id="main" className="architecture-main">
    <header className="architecture-heading"><p>DATA PLATFORM FIELD GUIDE</p><h1>One architecture. Several vocabularies.</h1><div>Source → Move → Store → Process → Model → Serve. Operate and govern across every stage.</div></header>
    <section className="architecture-filters" aria-label="Architecture controls">
      <label>Workload<Select aria-label="Workload" value={workload} onChange={event => { setWorkload(event.currentTarget.value as Workload); setStage('source'); }}>{Object.entries(workloadNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</Select></label>
      <label>Provider<Select aria-label="Provider" value={provider} onChange={event => setProvider(event.currentTarget.value as Provider)}>{providers.map(id => <option key={id} value={id}>{providerNames[id]}</option>)}</Select></label>
      <label>Layout<Select aria-label="Layout" value={layout} disabled={view !== 'architecture'} onChange={event => setLayout(event.currentTarget.value as 'layered' | 'radial')}><option value="layered">Layered flow</option><option value="radial">Radial / hub</option></Select></label>
      <label>Semantic view<Select aria-label="Semantic view" value={view} onChange={event => setView(event.currentTarget.value)}><option value="architecture">Architecture diagram</option><option value="workflow">Workflow state</option><option value="lineage">Column lineage</option></Select></label>
      <Switch label="Reduced motion" checked={actualReduced} onChange={(_, data) => setReduced(data.checked)} />
    </section>
    <nav className="architecture-stages" aria-label="Logical stages">{stages.map(id => <Button key={id} appearance={stage === id ? 'primary' : 'subtle'} aria-pressed={stage === id} onClick={() => { setStage(id); setView('architecture'); }}>{stageNames[id]}</Button>)}</nav>
    <div className="architecture-workbench"><section className="architecture-canvas" aria-label="Architecture figure"><Suspense fallback={<p role="status">Loading semantic renderer…</p>}><FigurePlayer key={view} figure={displayed} locale={locale} reducedMotion={reduced} presentationSize="expanded" captions={view === 'workflow' ? retry.captions : view === 'architecture' ? stages.map(id => stageIntent[id]) : undefined} selectedId={view === 'architecture' ? stage : undefined} onSelect={id => { if (stages.includes(id as Stage)) setStage(id as Stage); }} frameIndex={view === 'architecture' ? stages.indexOf(stage) : undefined} onFrameChange={index => { if (view === 'architecture') setStage(stages[index]); }} showInspector={view !== 'architecture'} /></Suspense></section>
    <InspectorPanel title={`Stage Lens · ${stageNames[stage]}`} description={stageIntent[stage]}><p className="architecture-current">{translations[workload][provider][stages.indexOf(stage)]}</p><p>{stage === 'process' ? 'Spark and SQL names describe external compute choices. This Atlas explains them; it does not run them.' : 'Choose a provider without changing the logical responsibility of this stage.'}</p><h3>Compare provider translations</h3><Table aria-label="Stage provider comparison"><TableHeader><TableRow><TableHeaderCell>Provider</TableHeaderCell><TableHeaderCell>Translation</TableHeaderCell></TableRow></TableHeader><TableBody>{providers.map(id => <TableRow key={id}><TableCell>{providerNames[id]}</TableCell><TableCell>{translations[workload][id][stages.indexOf(stage)]}</TableCell></TableRow>)}</TableBody></Table></InspectorPanel></div>
    <section className="architecture-source"><p>Adapted from {architectureSource.label.toLowerCase()}. Provider terminology reflects the 4 September 2026 reference; confirm availability before deploying.</p><ContentDetails><p>Sixteen workload/provider variants. Source reference: {architectureSource.id}. Pinned snapshot: {architectureSource.verifiedAt}; not live service verification.</p><p>Local explanatory diagrams only. Spark names describe external compute, not execution here. Lineage is hand-authored, not parsed from SQL.</p></ContentDetails></section>
  </main></div>;
}
