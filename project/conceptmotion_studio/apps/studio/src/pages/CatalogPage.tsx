import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardFooter,
  CardHeader,
  Dropdown,
  Option,
  Text,
} from '@fluentui/react-components';
import { ArrowRight16Regular, GridDots24Regular } from '@fluentui/react-icons';
import {
  CatalogShell,
  FigureFrame,
  PageHeader,
  SearchFilterBar,
  resolveLocalizedText,
  useLocale,
} from '@datapass/ui';
import type { ViewId } from '../App';
import { catalogItems, type CatalogCategory } from '../data/catalog';
import { figureLabels } from '../lib/localizedChrome';

const categories: Array<'all' | CatalogCategory> = ['all', 'semantics', 'workflow', 'learning', 'knowledge'];

export function CatalogPage({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | CatalogCategory>('all');
  const { locale } = useLocale();

  const filtered = useMemo(() => catalogItems.filter((item) => {
    const haystack = [item.title.en, item.title.no, item.summary.en, item.summary.no, item.surface, ...item.tags]
      .filter(Boolean).join(' ').toLocaleLowerCase();
    return (category === 'all' || item.category === category)
      && (!query || haystack.includes(query.toLocaleLowerCase()));
  }), [category, query]);

  const filters = (
    <SearchFilterBar
      query={query}
      onQueryChange={setQuery}
      placeholder={locale === 'no' ? 'Søk i scener og arbeidsflater' : 'Search scenes and workspaces'}
      filters={(
        <Dropdown
          aria-label={locale === 'no' ? 'Kategori' : 'Category'}
          value={category === 'all' ? (locale === 'no' ? 'Alle kategorier' : 'All categories') : category}
          selectedOptions={[category]}
          onOptionSelect={(_, data) => setCategory((data.optionValue ?? 'all') as typeof category)}
        >
          {categories.map((value) => (
            <Option key={value} value={value}>
              {value === 'all' ? (locale === 'no' ? 'Alle kategorier' : 'All categories') : value}
            </Option>
          ))}
        </Dropdown>
      )}
    />
  );

  const results = (
    <section aria-label={locale === 'no' ? 'Foundation-overflater' : 'Foundation surfaces'}>
      <div className="section-heading">
        <div>
          <h2>{filtered.length} {locale === 'no' ? 'overflater' : 'surfaces'}</h2>
          <p>{locale === 'no' ? 'Kuraterte bevis på de gjenbrukbare kontraktene i v1.1.' : 'Curated proofs of the reusable v1.1 contracts.'}</p>
        </div>
        <Badge appearance="tint" color="informative">15 gold proofs</Badge>
      </div>
      <div className="surface-grid">
        {filtered.map((item) => (
          <Card key={item.id} className="surface-card" data-testid={`catalog-${item.id}`}>
            <CardHeader
              header={<Text weight="semibold">{resolveLocalizedText(item.title, locale)}</Text>}
              description={<span className="surface-card__eyebrow">{item.surface} · {item.category}</span>}
            />
            <p>{resolveLocalizedText(item.summary, locale)}</p>
            <div className="metadata-row">
              {item.tags.slice(0, 3).map((tag) => <Badge key={tag} appearance="outline">{tag}</Badge>)}
            </div>
            <CardFooter className="surface-card__footer">
              <Badge color={item.status === 'live' ? 'success' : 'informative'} appearance="tint">
                {item.status === 'live' ? 'LIVE' : 'FOUNDATION'}
              </Badge>
              <Button appearance="subtle" icon={<ArrowRight16Regular />} iconPosition="after" onClick={() => onNavigate(item.target)}>
                {locale === 'no' ? 'Åpne' : 'Open'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="surface-card" role="status">
          <h3>{locale === 'no' ? 'Ingen treff' : 'No matching surfaces'}</h3>
          <p>{locale === 'no' ? 'Prøv et annet søk eller en annen kategori.' : 'Try another search or category.'}</p>
          <Button onClick={() => { setQuery(''); setCategory('all'); }}>{locale === 'no' ? 'Tilbakestill' : 'Reset'}</Button>
        </div>
      )}
    </section>
  );

  const neutralProof = (
    <FigureFrame
      {...figureLabels(locale)}
      title={locale === 'no' ? 'Én ramme, flere renderere' : 'One frame, many renderers'}
      subtitle={locale === 'no' ? 'Dette er en lokal SVG-komponent, ikke ConceptMotion.' : 'This is a local SVG component, not ConceptMotion.'}
      takeaway={locale === 'no' ? 'Applikasjonslayouten kjenner ikke rendererens geometri.' : 'Application layout does not know the renderer geometry.'}
      source="Local renderer-neutral contract proof"
      fallback="Three renderer families connect to the same figure surface."
    >
      <svg viewBox="0 0 720 210" role="img" aria-label="ConceptMotion, future charts and static SVG all enter the same figure frame">
        <defs>
          <marker id="catalog-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#6c7d80" /></marker>
        </defs>
        {['ConceptMotion', 'future @datapass/charts', 'local SVG'].map((label, index) => (
          <g key={label} transform={`translate(${38 + index * 222} 42)`}>
            <rect width="188" height="62" rx="8" fill={index === 0 ? '#dceff0' : '#f6f8f8'} stroke={index === 0 ? '#0b6f73' : '#cbd5d7'} />
            <text x="94" y="37" textAnchor="middle" fontSize="13" fontWeight="650" fill="#203438">{label}</text>
            <path d="M94 70V112" stroke="#6c7d80" strokeWidth="2" markerEnd="url(#catalog-arrow)" />
          </g>
        ))}
        <rect x="155" y="164" width="410" height="34" rx="6" fill="#ffffff" stroke="#0b6f73" />
        <text x="360" y="186" textAnchor="middle" fontSize="12" fontWeight="700" fill="#075a5e">FigureFrame / VisualizationSurface</text>
      </svg>
    </FigureFrame>
  );

  return (
    <CatalogShell
      data-testid="catalog-page"
      header={(
        <PageHeader
          eyebrow="DATAPASS VISUAL PLATFORM · V1.1"
          title={locale === 'no' ? 'Visuelle læringsflater som deler kontrakter' : 'Visual learning surfaces that share contracts'}
          description={locale === 'no'
            ? 'Utforsk semantisk bevegelse, arbeidsflyter, kodeøvelser og kildebevisst dokumentasjon uten å blande ansvar.'
            : 'Explore semantic motion, workflows, code practice and source-aware documentation without collapsing their responsibilities.'}
          metadata={<Badge appearance="outline" icon={<GridDots24Regular />}>Local fixture edition</Badge>}
        />
      )}
      filters={filters}
      results={results}
      detail={neutralProof}
    />
  );
}
