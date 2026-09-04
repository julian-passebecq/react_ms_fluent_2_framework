import type { ProgressStateV2 } from '@datapass/progress';
import { CatalogShell, EntityCard, EntityTable, SearchFilterBar, ViewToggle, filterAndSortCatalogItems, setCatalogFacetValues, setCatalogQuery, setCatalogView, useCatalogUrlState } from '@datapass/ui';
import { Badge, Button, Field, Select } from '@fluentui/react-components';
import { practiceCatalog, practiceItems } from '../../../../content/practice';
import type { PracticeItem } from '@datapass/content';
const config = { allowedFacets: ['track', 'difficulty', 'language', 'status'], defaultView: 'table' as const };
export default function CatalogPage({ progress, onSelect }: { progress: ProgressStateV2; onSelect: (id: string) => void }) {
  const [state, setState] = useCatalogUrlState({ config });
  const filtered = filterAndSortCatalogItems(practiceItems, state, {
    searchText: item => [item.title, item.summary, item.domain, ...item.tags],
    facetValues: (item, facet) => facet === 'track' ? [item.trackId] : facet === 'difficulty' ? [item.difficulty] : facet === 'language' ? item.variants.map(v => v.language) : [progress.challenges[item.id]?.mastered ? 'mastered' : 'unmastered', progress.challenges[item.id]?.review ? 'review' : '', progress.challenges[item.id]?.flagged ? 'flagged' : '', progress.challenges[item.id]?.status ?? 'not-started'],
  });
  const facet = (key: string, label: string, options: { value: string; label: string }[]) => <Field className="sandbox-catalog-facet" label={label}><Select aria-label={label} value={state.filters[key]?.[0] ?? ''} onChange={event => setState(current => setCatalogFacetValues(current, key, event.target.value ? [event.target.value] : []))}><option value="">All</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></Field>;
  return <CatalogShell header={<SearchFilterBar label="Search practice" placeholder="Search title, pattern, or topic" query={state.query} onQueryChange={value => setState(current => setCatalogQuery(current, value))} filters={<>
    {facet('track', 'Domain / track', practiceCatalog.tracks.map(t => ({ value: t.id, label: t.name })))}
    {facet('difficulty', 'Difficulty', ['Easy', 'Medium', 'Hard'].map(value => ({ value, label: value })))}
    {facet('language', 'Language / engine', [...new Set(practiceItems.flatMap(i => i.variants.map(v => v.language)))].sort().map(value => ({ value, label: value })))}
    {facet('status', 'Practice status', ['not-started', 'in-progress', 'mastered', 'review', 'flagged'].map(value => ({ value, label: value })))}
  </>} actions={<ViewToggle value={state.view} onChange={value => setState(current => setCatalogView(current, value))} />} />} results={<>
    <div className="sandbox-catalog-summary"><p role="status">{filtered.length} of 323 practice items</p><div className="sandbox-actions"><Button onClick={() => setState(current => setCatalogFacetValues(current, 'status', ['review']))}>Review queue</Button><Button onClick={() => setState(current => ({ ...current, query: '', filters: {} }))}>Clear filters</Button></div></div>
    {filtered.length === 0 ? <p>No exercises match these filters.</p> : state.view === 'cards' ? <div className="sandbox-grid">{filtered.map(item => <EntityCard key={item.id} entityId={item.id} title={item.title} eyebrow={item.domain} description={item.concept} metadata={<Badge appearance="outline">{item.difficulty}</Badge>} onSelect={onSelect} />)}</div>
      : <EntityTable<PracticeItem> items={filtered} getRowId={item => item.id} onRowSelect={item => onSelect(item.id)} columns={[{ id: 'title', header: 'Practice item', renderCell: item => <><strong>{item.title}</strong><small>{item.domain}</small></> }, { id: 'difficulty', header: 'Difficulty', renderCell: item => item.difficulty }, { id: 'engines', header: 'Languages', renderCell: item => item.variants.map(v => v.label).join(' · ') }, { id: 'status', header: 'Progress', renderCell: item => progress.challenges[item.id]?.mastered ? 'Mastered' : progress.challenges[item.id]?.flagged ? 'Flagged' : progress.challenges[item.id]?.status ?? 'Not started' }]} />}
  </>} />;
}
