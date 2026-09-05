import { lazy, Suspense, useEffect, useState } from 'react';
import { Button, Select } from '@fluentui/react-components';
import { CatalogShell, EntityCard, LanguageToggle, SearchFilterBar, useLocale } from '@datapass/ui';
import { migratedVisuals, visualById } from '../../../content/visuals';

const SceneDetail = lazy(() => import('./SceneDetail'));
const readId = () => { try { return decodeURIComponent(location.hash.replace(/^#\/concept\//, '')); } catch { return ''; } };
export default function App() {
  const [id, setId] = useState(readId);
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('all');
  const { locale } = useLocale();
  useEffect(() => { const read = () => setId(readId()); addEventListener('hashchange', read); return () => removeEventListener('hashchange', read); }, []);
  const entry = visualById(id);
  const results = migratedVisuals.filter(v => (domain === 'all' || v.domain === domain) && `${v.figure.title} ${v.invariant}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="atlas-app dp-consumer"><a href="#main" className="atlas-skip">Skip to content</a><header className="atlas-top"><a className="atlas-brand" href="#">Algorithm Atlas</a><span>Patterns, explained.</span><LanguageToggle /></header><main id="main" className="atlas-main">
    {entry ? <Suspense fallback={<p role="status">Loading explanation…</p>}><SceneDetail entry={entry} locale={locale} /></Suspense> : <>
      <header className="atlas-heading"><p className="atlas-eyebrow">THE CONCEPT LIBRARY</p><h1>See the invariant.</h1><p>Thirty focused visual explanations. Keep the meaning; change the example.</p></header>
      <CatalogShell header={<SearchFilterBar query={query} onQueryChange={setQuery} label="Search concepts" placeholder="Search a concept or invariant" filters={<label>Domain <Select aria-label="Concept domain" value={domain} onChange={e => setDomain(e.currentTarget.value)}><option value="all">All domains</option>{['SQL', 'Algorithms', 'Data engineering', 'ML / statistics'].map(name => <option key={name}>{name}</option>)}</Select></label>} />} resultsLabel="Concept catalog" results={<><p className="atlas-count">{results.length} concepts · step-by-step explanations</p><div className="atlas-grid">{results.map(v => <EntityCard key={v.id} entityId={v.id} title={String(v.figure.title)} eyebrow={v.domain} description={v.invariant} footer={`${v.captions.length} steps`} onSelect={() => { location.hash = `/concept/${v.id}`; }} />)}</div>{!results.length ? <p>No concepts match. <Button onClick={() => { setQuery(''); setDomain('all'); }}>Clear filters</Button></p> : null}</>} />
    </>}
  </main><footer className="atlas-footer">Explore a pattern. Follow each step. Explain the result.</footer></div>;
}
